import datetime
import uuid
from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower

from apps.common.storage import get_resident_id_storage, id_document_upload_to


def generate_reference_no() -> str:
    """Generate reference number in format: MVA-{year}-{8 character random code}"""
    year = datetime.date.today().year
    random_code = uuid.uuid4().hex[:8].upper()
    return f"MVA-{year}-{random_code}"


class ApplicationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


def id_document_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return f"registrations/id_documents/{uuid.uuid4().hex}{ext}"


class RegistrationApplication(models.Model):
    reference_no = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        default=generate_reference_no,
        help_text="Reference number in format: MVA-{year}-{8 char random code}"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_initial = models.CharField(max_length=4, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    password = models.CharField(max_length=255)

    unit = models.ForeignKey("properties.Property", null=True, blank=True, on_delete=models.SET_NULL, related_name="registration_applications")
    id_document = models.ImageField(upload_to=id_document_upload_to, storage=get_resident_id_storage, max_length=500)

    status = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    # PROTECT: users are deactivated, never hard-deleted, so review history stays intact.
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="reviewed_applications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        db_table = "registration_applications"
        constraints = [
            # One pending application per email (case-insensitive). Rejected and
            # approved rows don't count, so a rejected applicant can reapply.
            models.UniqueConstraint(
                Lower("email"),
                condition=Q(status="pending"),
                name="uniq_pending_application_per_email",
            ),
        ]

    def __str__(self):
        return f"{self.email} ({self.status})"