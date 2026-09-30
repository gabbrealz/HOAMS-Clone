from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.common.storage import get_resident_id_storage, id_document_upload_to


class Resident(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resident")
    unit = models.ForeignKey(
        "properties.Property",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="residents",
    )
    id_document = models.ImageField(
        upload_to=id_document_upload_to,
        storage=get_resident_id_storage,
        max_length=500,
    )
    registration_application = models.OneToOneField(
        "registrations.RegistrationApplication",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resident",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "residents"

    def __str__(self):
        return f"Resident: {self.user.email}"