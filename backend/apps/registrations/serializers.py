from django.contrib.auth import password_validation
from django.core.validators import FileExtensionValidator
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.properties.models import Property
from apps.registrations.models import RegistrationApplication
from apps.registrations.selectors import list_claimable_properties, pending_application_exists
from apps.users.selectors import get_user_by_email

MAX_ID_DOCUMENT_BYTES = 5 * 1024 * 1024  # 5 MB


class ClaimablePropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "block_and_lot"]


class ApplicationSubmitSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    middle_initial = serializers.CharField(max_length=4)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True, min_length=8, style={"input_type": "password"}
    )
    # Only units without an owner are valid choices.
    unit = serializers.PrimaryKeyRelatedField(queryset=list_claimable_properties())
    # ImageField makes Pillow open the file, so a renamed .exe fails here.
    id_document = serializers.ImageField(
        validators=[FileExtensionValidator(["jpg", "jpeg", "png"])]
    )

    def validate_email(self, value):
        if get_user_by_email(email=value) is not None:
            raise serializers.ValidationError("An account with this email already exists.")
        if pending_application_exists(email=value):
            raise serializers.ValidationError("An application for this email is already pending review.")
        return value

    def validate_password(self, value):
        password_validation.validate_password(value)  # runs AUTH_PASSWORD_VALIDATORS
        return value

    def validate_id_document(self, value):
        if value.size > MAX_ID_DOCUMENT_BYTES:
            raise serializers.ValidationError("The ID document must be 5 MB or smaller.")
        return value


class ApplicationReceiptSerializer(serializers.ModelSerializer):
    """What the applicant gets back: deliberately minimal."""

    class Meta:
        model = RegistrationApplication
        fields = ["id", "status", "submitted_at", "reference_no", "rejection_reason"]
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):
    """What staff see. Never exposes password or the raw file path."""

    unit = serializers.SerializerMethodField()
    reviewed_by = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationApplication
        fields = [
            "id", "first_name", "last_name", "middle_initial",
            "email", "phone", "unit", "status", "submitted_at",
            "reviewed_by", "reviewed_at", "rejection_reason",
            "reference_no",
        ]
        read_only_fields = fields

    def get_unit(self, obj):
        if obj.unit is None:
            return None
        return {"id": obj.unit.id, "block_and_lot": obj.unit.block_and_lot, "address": obj.unit.street_address}

    def get_reviewed_by(self, obj):
        return obj.reviewed_by.email if obj.reviewed_by else None


class RejectSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=2000)