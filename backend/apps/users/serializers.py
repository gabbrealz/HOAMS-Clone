from django.contrib.auth import authenticate
from rest_framework import serializers

from apps.users.models import User, UserRole
from apps.users.services import create_staff_account
from apps.residents.models import Resident


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="role",
        source="role_assignments"
    )

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "middle_initial", "phone",
            "status", "is_active", "roles",
        ]
        read_only_fields = fields


class StaffAccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "middle_initial", "last_name", "phone"]

    def create(self, validated_data):
        return create_staff_account(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is not active.")
        attrs["user"] = user
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone"]


class RoleUpdateSerializer(serializers.Serializer):
    roles = serializers.ListField(
        child=serializers.ChoiceField(choices=UserRole.choices),
        allow_empty=False,
    )

    def validate_roles(self, value):
        roles_set = set(value)

        # 1. Prevent assigning User Administrator role
        admin_role_values = {UserRole.USER_ADMINISTRATOR, "user_administrator"}
        if roles_set.intersection(admin_role_values):
            raise serializers.ValidationError(
                "Assigning the User Administrator role is not allowed."
            )

        # 2. Prevent simultaneous Board Member and Administrative Staff roles
        has_board = bool(roles_set.intersection({UserRole.BOARD_MEMBER, "board_member"}))
        has_staff = bool(roles_set.intersection({UserRole.ADMINISTRATIVE_STAFF, "administrative_staff"}))

        if has_board and has_staff:
            raise serializers.ValidationError(
                "A user cannot simultaneously be both a Board Member and Administrative Staff."
            )

        # 3. Prevent assigning Resident role if user lacks a row in the residents table
        resident_role_values = {UserRole.RESIDENT, "resident"}
        has_resident = bool(roles_set.intersection(resident_role_values))

        if has_resident:
            # Gets target user from serializer instance or context
            user = self.instance or self.context.get("user")
            if user and not Resident.objects.filter(user=user).exists():
                raise serializers.ValidationError(
                    "Cannot assign a resident role to a user without a profile in the residents table."
                )

        return list(roles_set)

    def save(self, **kwargs):
        return self.validated_data