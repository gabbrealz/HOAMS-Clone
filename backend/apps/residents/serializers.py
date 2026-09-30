from rest_framework import serializers

from apps.residents.models import Resident

class ResidentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    middle_initial = serializers.CharField(source="user.middle_initial", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    unit = serializers.SerializerMethodField()
    roles = serializers.SlugRelatedField(
        source="user.role_assignments",
        many=True,
        read_only=True,
        slug_field="role",
    )

    class Meta:
        model = Resident
        fields = [
            "id",
            "first_name",
            "middle_initial",
            "last_name",
            "email",
            "phone",
            "unit",
            "roles",
            "created_at",
            "updated_at",
        ]

    def get_unit(self, obj):
        if obj.unit is None:
            return None
        return {"id": obj.unit.id, "block_and_lot": obj.unit.block_and_lot, "address": obj.unit.street_address}
