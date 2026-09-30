from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

from decouple import config

User = get_user_model()


class Command(BaseCommand):
    """Ensures at least one User Administrator exists. Creates one if none exists using environment variables."""

    def handle(self, *args, **options):
        admin_email = config("USER_ADMIN_EMAIL", default=None)
        admin_password = config("USER_ADMIN_PASSWORD", default=None)
        admin_first_name = config("USER_ADMIN_FNAME", default="")
        admin_last_name = config("USER_ADMIN_LNAME", default="")
        admin_middle_initial = config("USER_ADMIN_MI", default="")

        if not admin_email or not admin_password:
            self.stderr.write(
                "ERROR: USER_ADMIN_EMAIL and USER_ADMIN_PASSWORD environment variables must be set."
            )
            return

        # Check if a User Administrator already exists
        user_administrator_role = User.Role.USER_ADMINISTRATOR
        existing_admin = (
            User.objects.filter(role_assignments__role=user_administrator_role)
            .distinct()
            .first()
        )

        if existing_admin:
            self.stdout.write(
                self.style.SUCCESS(
                    f"User Administrator already exists: {existing_admin.email}"
                )
            )
            return

        # Create the User Administrator
        with transaction.atomic():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password=admin_password,
                first_name=admin_first_name,
                last_name=admin_last_name,
                middle_initial=admin_middle_initial,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created User Administrator: {admin_user.email}"
            )
        )