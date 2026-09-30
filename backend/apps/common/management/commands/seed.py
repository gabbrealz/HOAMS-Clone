import random
import re
from pathlib import Path
from faker import Faker

from django.core.management.base import BaseCommand
from django.db import transaction
from django.core.files.base import ContentFile
from django.conf import settings

from apps.users.models import User, UserRole
from apps.users.services import assign_roles, create_staff_account
from apps.registrations.models import RegistrationApplication
from apps.registrations.services import submit_application, approve_application
from apps.properties.models import Property

fake = Faker("en_PH")


def generate_ph_phone():
    """Generate a realistic Philippine mobile number in 09XXXXXXXXX format."""
    return f"09{fake.random_number(digits=9, fix_len=True)}"


def generate_middle_initial():
    """Generate a single uppercase letter for middle initial."""
    return chr(random.randint(65, 90))


def sanitize_username(name):
    """Remove non-alphanumeric characters for clean email prefix creation."""
    return re.sub(r"[^a-zA-Z0-9]", "", name).lower()


class Command(BaseCommand):
    help = "Seed the database with staff, approved residents, board members, and pending registration applications."

    def add_arguments(self, parser):
        parser.add_argument(
            "--residents",
            type=int,
            default=30,
            help="Number of approved regular residents to create",
        )
        parser.add_argument(
            "--board-members",
            type=int,
            default=15,
            help="Number of approved board members to create",
        )
        parser.add_argument(
            "--staff",
            type=int,
            default=15,
            help="Number of administrative staff to create",
        )
        parser.add_argument(
            "--pending",
            type=int,
            default=10,
            help="Number of pending registration applications to create",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear previously seeded test data before seeding",
        )

    def handle(self, *args, **options):
        residents_count = options["residents"]
        board_members_count = options["board_members"]
        staff_count = options["staff"]
        pending_count = options["pending"]

        total_approved = residents_count + board_members_count
        total_properties_needed = total_approved + pending_count
        total_users = total_approved + staff_count

        # 1. Option to clear existing test data
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing previously seeded test data..."))
            with transaction.atomic():
                # Unassign properties owned by test residents
                Property.objects.filter(
                    owner__user__email__endswith="@example.com"
                ).update(owner=None)

                # Delete pending registration applications
                RegistrationApplication.objects.filter(
                    email__endswith="@example.com"
                ).delete()

                # Delete test users (CASCADE removes associated Resident profiles)
                User.objects.filter(email__endswith="@example.com").delete()

            self.stdout.write(self.style.SUCCESS("✓ Seeded test data cleared successfully.\n"))

        self.stdout.write(
            f"Starting seed process: {total_users} active accounts & {pending_count} pending applications..."
        )

        # 2. Verify property availability dynamically
        unassigned_properties = list(
            Property.objects.filter(owner__isnull=True).order_by("id")[:total_properties_needed]
        )

        if len(unassigned_properties) < total_properties_needed:
            self.stderr.write(
                self.style.ERROR(
                    f"Not enough unassigned properties. Found {len(unassigned_properties)}, "
                    f"need {total_properties_needed} ({total_approved} for approved + {pending_count} for pending)."
                )
            )
            return

        # 3. Verify seed asset image existence
        image_path = Path(settings.BASE_DIR) / "apps" / "common" / "seeds" / "assets" / "HOA-ID.jpg"
        if not image_path.exists():
            self.stderr.write(self.style.ERROR(f"Seed asset image not found at: {image_path}"))
            return

        with open(image_path, "rb") as f:
            raw_image_bytes = f.read()

        # 4. Atomic Seeding Transaction
        with transaction.atomic():
            # A. Create administrative staff accounts
            staff_users = []
            for i in range(staff_count):
                first_name = fake.first_name()
                last_name = fake.last_name()
                clean_first = sanitize_username(first_name)
                clean_last = sanitize_username(last_name)
                email = f"{clean_first}.{clean_last}{i}@staff.mva.com"

                user = create_staff_account(
                    email=email,
                    password="Password123!",
                    first_name=first_name,
                    last_name=last_name,
                )
                staff_users.append(user)

            self.stdout.write(self.style.SUCCESS(f"✓ Created {len(staff_users)} staff users."))

            admin_reviewer = staff_users[0] if staff_users else None

            # B. Create approved Residents & Board Members
            for i in range(total_approved):
                role = UserRole.BOARD_MEMBER if i < board_members_count else UserRole.RESIDENT

                first_name = fake.first_name()
                last_name = fake.last_name()
                middle_initial = generate_middle_initial()
                phone = generate_ph_phone()

                clean_first = sanitize_username(first_name)
                clean_last = sanitize_username(last_name)
                email = f"{clean_first}.{clean_last}{i}@resident.com"
                password = "Password123!"

                prop = unassigned_properties[i]
                doc_file = ContentFile(raw_image_bytes, name=f"HOA-ID-app-{i}.jpg")

                # 1. Submit application
                app = submit_application(
                    first_name=first_name,
                    last_name=last_name,
                    middle_initial=middle_initial,
                    email=email,
                    password=password,
                    unit=prop,
                    id_document=doc_file,
                    phone=phone,
                )

                # 2. Approve application
                if admin_reviewer:
                    approve_application(application_id=app.pk, reviewer=admin_reviewer)

                # 3. Assign board member role if applicable
                if role == UserRole.BOARD_MEMBER:
                    user = User.objects.get(email=email)
                    assign_roles(user=user, roles=[role])

            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Created {residents_count} approved residents & {board_members_count} approved board members."
                )
            )

            # C. Create Pending Registration Applications (Not Approved)
            for j in range(pending_count):
                prop_index = total_approved + j
                prop = unassigned_properties[prop_index]

                first_name = fake.first_name()
                last_name = fake.last_name()
                middle_initial = generate_middle_initial()
                phone = generate_ph_phone()

                clean_first = sanitize_username(first_name)
                clean_last = sanitize_username(last_name)
                email = f"{clean_first}.{clean_last}{j}@pending.com"
                password = "Password123!"

                doc_file = ContentFile(raw_image_bytes, name=f"HOA-ID-pending-{j}.jpg")

                submit_application(
                    first_name=first_name,
                    last_name=last_name,
                    middle_initial=middle_initial,
                    email=email,
                    password=password,
                    unit=prop,
                    id_document=doc_file,
                    phone=phone,
                )

            self.stdout.write(
                self.style.SUCCESS(f"✓ Created {pending_count} pending registration applications.")
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n🎉 Database seeding finished successfully! Total properties processed: {total_properties_needed}"
            )
        )