from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import prefetch_related_objects

from apps.users.models import UserRole
from apps.users.permissions import (
    RequireHigherPrivilege,
    IsSelfRole,
    IsBoardMemberRole,
    IsAdministrativeStaffRole,
    IsUserAdministratorRole
)
from apps.users.selectors import get_user_by_id, list_users
from apps.users.serializers import (
    LoginSerializer,
    RoleUpdateSerializer,
    StaffAccountCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from apps.users.services import assign_roles, deactivate_user, update_user


class StaffAccountCreateView(generics.CreateAPIView):
    serializer_class = StaffAccountCreateSerializer
    permission_classes = [IsUserAdministratorRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # No token: the account belongs to the new staff member, not the caller.
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # 1. Fetch related roles for the existing user instance (1 query instead of 2)
        prefetch_related_objects([user], "role_assignments")

        # 2. Retrieve or create the authentication token
        token, _ = Token.objects.get_or_create(user=user)

        # 3. Construct JSON response payload
        response = Response({
            "user": UserSerializer(user).data,
            "message": "Login successful"
        })

        is_https = request.is_secure() or request.headers.get("X-Forwarded-Proto") == "https"

        # 4. Set HttpOnly cookie
        response.set_cookie(
            key="auth_token",
            value=token.key,
            httponly=True,                          # Prevents JavaScript reading (XSS protection)
            secure=is_https,                        # HTTPS only in production
            samesite="None" if is_https else "Lax", # Prevents CSRF on cross-site requests
            max_age=60 * 60 * 24 * 7,               # Cookie lifetime in seconds (7 days)
        )
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1. Safely delete token from database (prevents AttributeError if token is missing)
        if hasattr(request.user, "auth_token"):
            request.user.auth_token.delete()

        # 2. Instantiate response FIRST
        response = Response({"message": "Logout successful"})

        is_https = request.is_secure() or request.headers.get("X-Forwarded-Proto") == "https"

        # 3. Attach delete_cookie to the response instance
        response.delete_cookie(
            key="auth_token",
            samesite="None" if is_https else "Lax",
            secure=is_https,
            httponly=True,
            path="/",  # Ensures cookie is cleared across all endpoints
        )

        return response


class UserMeView(APIView):
    """
    GET /api/users/me/
    Returns the current authenticated user's profile and roles.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Efficiently fetch roles for serializer
        prefetch_related_objects([user], "role_assignments")

        return Response(UserSerializer(user).data)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole | IsUserAdministratorRole]

    def get_queryset(self):
        qs = list_users(
            role=self.request.query_params.get("role"),
            status=self.request.query_params.get("status"),
        )
        return qs.exclude(role_assignments__role=UserRole.USER_ADMINISTRATOR).distinct()


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelfRole | IsAdministrativeStaffRole | IsBoardMemberRole | IsUserAdministratorRole]

    def get_object(self):
        user = get_user_by_id(user_id=self.kwargs["pk"])
        self.check_object_permissions(self.request, user)
        return user


class UserUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequireHigherPrivilege]

    def patch(self, request, pk):
        user = get_user_by_id(user_id=pk)
        self.check_object_permissions(request, user)
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = update_user(user=user, data=serializer.validated_data)
        return Response(UserSerializer(user).data)


class RoleUpdateView(APIView):
    permission_classes = [IsUserAdministratorRole]

    def patch(self, request, pk):
        user = get_user_by_id(user_id=pk)
        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Pass the validated list of roles to your service/utility function
        user = assign_roles(user=user, roles=serializer.validated_data["roles"])
        
        return Response(UserSerializer(user).data)


class UserDeleteView(APIView):
    permission_classes = [RequireHigherPrivilege]

    def delete(self, request, pk):
        user = get_user_by_id(user_id=pk)
        deactivate_user(user=user)
        return Response(status=status.HTTP_204_NO_CONTENT)