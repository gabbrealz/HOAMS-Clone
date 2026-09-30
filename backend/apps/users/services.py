from typing import List, Union
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.users.models import User, UserRole, UserStatus, RESIDENT_ROLES, STAFF_ROLES, UserRoleAssignment
from apps.residents.models import Resident


@transaction.atomic
def register_user(*, email, password, first_name="", last_name="", middle_initial="", phone=""):
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        middle_initial=middle_initial,
        last_name=last_name,
        phone=phone,
    )
    # Assign default resident role
    UserRoleAssignment.objects.create(user=user, role=UserRole.RESIDENT)
    return user


@transaction.atomic
def create_staff_account(*, email, password, first_name="", middle_initial="", last_name="", phone=""):
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        middle_initial=middle_initial,
        last_name=last_name,
        phone=phone,
    )
    # Assign administrative staff role to staff accounts
    UserRoleAssignment.objects.create(user=user, role=UserRole.ADMINISTRATIVE_STAFF)
    return user


@transaction.atomic
def update_user(*, user: User, data: dict) -> User:
    allowed_fields = ["first_name", "last_name", "middle_initial", "phone"]
    updated_fields = []
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
            updated_fields.append(field)
    if updated_fields:
        user.save(update_fields=updated_fields + ["updated_at"])
    return user


@transaction.atomic
def assign_roles(*, user: User, roles: List[Union[str, UserRole]]) -> User:
    # Normalize input roles and resident roles to plain strings (handling Enums if passed)
    target_roles = [r.value if hasattr(r, "value") else str(r) for r in roles]
    resident_roles = {r.value if hasattr(r, "value") else str(r) for r in RESIDENT_ROLES}

    # Require an existing Resident record if assigning any resident-side role
    has_resident_role = any(r in resident_roles for r in target_roles)
    if has_resident_role and not Resident.objects.filter(user=user).exists():
        raise ValidationError(
            {"roles": "Cannot assign a resident role to a user without a profile in the residents table."}
        )

    # Clear previous role assignments to sync with the updated role list
    UserRoleAssignment.objects.filter(user=user).delete()

    # Bulk create new role assignments
    new_assignments = [
        UserRoleAssignment(user=user, role=role)
        for role in set(target_roles)
    ]
    UserRoleAssignment.objects.bulk_create(new_assignments)

    return user


@transaction.atomic
def deactivate_user(*, user: User) -> User:
    """Soft-deletes by marking the account inactive rather than removing the row,
    since users are referenced by residents, concern_tickets, announcements, and
    documents elsewhere in the schema."""
    user.status = UserStatus.INACTIVE
    user.is_active = False
    user.save(update_fields=["status", "is_active", "updated_at"])
    return user