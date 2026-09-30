from django.shortcuts import get_object_or_404

from apps.properties.models import Property
from apps.registrations.models import ApplicationStatus, RegistrationApplication


def list_claimable_properties():
    return Property.objects.filter(owner__isnull=True).order_by("block_and_lot")


def pending_application_exists(*, email: str) -> bool:
    return RegistrationApplication.objects.filter(
        email__iexact=email, status=ApplicationStatus.PENDING
    ).exists()


def list_applications(*, status: str | None = None):
    qs = RegistrationApplication.objects.select_related("unit", "reviewed_by").order_by(
        "-submitted_at"
    )
    if status:
        qs = qs.filter(status=status)
    return qs


def get_application(*, application_id: int) -> RegistrationApplication:
    # get_object_or_404 so an unknown id is a 404, not a 500.
    return get_object_or_404(
        RegistrationApplication.objects.select_related("unit", "reviewed_by"),
        pk=application_id,
    )