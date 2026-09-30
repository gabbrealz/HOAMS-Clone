from django.contrib.auth.hashers import make_password
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.properties.models import Property
from apps.registrations.exceptions import ApplicationConflict
from apps.registrations.models import ApplicationStatus, RegistrationApplication
from apps.residents.models import Resident
from apps.users.models import User, UserRole
from apps.users.services import register_user


def _ensure_pending(application: RegistrationApplication) -> None:
    if application.status != ApplicationStatus.PENDING:
        raise ApplicationConflict("This application has already been reviewed.")


@transaction.atomic
def submit_application(
    *, first_name, last_name, middle_initial, email, password, unit, id_document, phone=""
) -> RegistrationApplication:
    try:
        return RegistrationApplication.objects.create(
            first_name=first_name,
            last_name=last_name,
            middle_initial=middle_initial,
            email=email,
            phone=phone,
            password=make_password(password),
            unit=unit,
            id_document=id_document,
        )
    except IntegrityError:
        # Lost a race against the partial unique constraint (Step 4).
        raise ApplicationConflict("An application for this email is already pending review.")


@transaction.atomic
def approve_application(*, application_id: int, reviewer: User) -> RegistrationApplication:
    application = get_object_or_404(RegistrationApplication.objects.select_for_update(), pk=application_id)
    _ensure_pending(application)

    if User.objects.filter(email__iexact=application.email).exists():
        raise ApplicationConflict("An account with this email already exists.")

    unit = Property.objects.select_for_update().filter(pk=application.unit_id).first()
    if unit is None:
        raise ApplicationConflict("The property on this application no longer exists.")
    if unit.owner is not None:
        raise ApplicationConflict("This property already has an owner.")

    now = timezone.now()

    # Reuse the one place that creates users. Passing password=None gives an
    # unusable password; we then copy over the hash the applicant chose so it
    # isn't hashed a second time.
    user = register_user(
        email=application.email,
        password=None,
        first_name=application.first_name,
        last_name=application.last_name,
        middle_initial=application.middle_initial,
        phone=application.phone,
    )
    user.password = application.password
    user.save(update_fields=["password", "updated_at"])

    resident = Resident.objects.create(
        user=user,
        registration_application=application,
        unit=application.unit,
        id_document=application.id_document,
    )

    unit.owner = resident
    unit.save(update_fields=["owner", "updated_at"])

    application.status = ApplicationStatus.APPROVED
    application.reviewed_by = reviewer
    application.reviewed_at = now
    application.save(update_fields=["status", "reviewed_by", "reviewed_at"])
    return application


@transaction.atomic
def reject_application(*, application_id: int, reviewer: User, reason: str) -> RegistrationApplication:
    application = get_object_or_404(RegistrationApplication.objects.select_for_update(), pk=application_id)
    _ensure_pending(application)

    application.status = ApplicationStatus.REJECTED
    application.reviewed_by = reviewer
    application.reviewed_at = timezone.now()
    application.rejection_reason = reason
    application.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason"])
    return application