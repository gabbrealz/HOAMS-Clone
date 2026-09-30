from rest_framework import serializers
from .models import Property, OccupancyStatus


class PropertySerializer(serializers.ModelSerializer):
    # Convenience read-only fields from the linked Resident -> User models
    owner_name = serializers.CharField(
        source="owner.user.get_full_name", read_only=True, default=None
    )
    owner_email = serializers.EmailField(
        source="owner.user.email", read_only=True, default=None
    )
    occupancy_status_display = serializers.CharField(
        source="get_occupancy_status_display", read_only=True
    )

    class Meta:
        model = Property
        fields = [
            "id",
            "block_and_lot",
            "street_address",
            "owner",  # Accepts Resident PK on write
            "owner_name",  # Friendly read-only name
            "owner_email",  # Friendly read-only email
            "occupancy_status",
            "occupancy_status_display",
            "is_for_rent",
            "rent_listed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        # Auto-manage rent_listed_at timestamp based on is_for_rent toggle
        is_for_rent = attrs.get("is_for_rent", getattr(self.instance, "is_for_rent", False))
        
        if is_for_rent and not getattr(self.instance, "is_for_rent", False):
            from django.utils import timezone
            attrs["rent_listed_at"] = timezone.now()
        elif not is_for_rent:
            attrs["rent_listed_at"] = None

        return attrs