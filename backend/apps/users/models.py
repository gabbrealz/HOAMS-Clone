from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.users.managers import UserManager


class UserRole(models.TextChoices):
    RESIDENT = "resident", "Resident"
    ADMINISTRATIVE_STAFF = "administrative_staff", "Administrative Staff"
    BOARD_MEMBER = "board_member", "Board Member"
    USER_ADMINISTRATOR = "user_administrator", "User Administrator"

RESIDENT_ROLES = frozenset({UserRole.RESIDENT, UserRole.BOARD_MEMBER})
STAFF_ROLES = frozenset({UserRole.ADMINISTRATIVE_STAFF, UserRole.BOARD_MEMBER})


class UserStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    SUSPENDED = "suspended", "Suspended"


class User(AbstractBaseUser, PermissionsMixin):
    Role = UserRole

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_initial = models.CharField(max_length=4, blank=True)
    phone = models.CharField(max_length=30, blank=True)

    status = models.CharField(max_length=20, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    STAFF_ROLES = {UserRole.ADMINISTRATIVE_STAFF, UserRole.BOARD_MEMBER, UserRole.USER_ADMINISTRATOR}

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email

    @property
    def is_staff(self) -> bool:
        return self.role_assignments.filter(
            role__in=self.STAFF_ROLES
        ).exists()

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE


class UserRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="role_assignments")
    role = models.CharField(max_length=30, choices=UserRole.choices)

    class Meta:
        db_table = "user_roles"
        unique_together = ["user", "role"]