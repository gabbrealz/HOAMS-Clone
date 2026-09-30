from rest_framework.permissions import BasePermission

from apps.users.models import User, UserRole


ROLE_RANKS = {
    UserRole.USER_ADMINISTRATOR: 3,
    UserRole.BOARD_MEMBER: 2,
    UserRole.ADMINISTRATIVE_STAFF: 2,
    UserRole.RESIDENT: 1,
}


def get_user_privilege_rank(user) -> int:
    """Returns the highest numerical rank for a given user."""
    if not user or not user.is_authenticated:
        return 0
    
    # Superusers bypass standard role limits
    if user.is_superuser:
        return float('inf')  # Always highest

    # Fetch all assigned roles for the user
    user_roles = user.role_assignments.values_list('role', flat=True)
    
    # Return the maximum rank among their assigned roles
    ranks = [ROLE_RANKS.get(role, 0) for role in user_roles]
    return max(ranks, default=0)


class RequireHigherPrivilege(BasePermission):
    """
    Grants permission ONLY if request.user has a strictly HIGHER privilege 
    rank than the target object's rank.
    
    Denied if target is equal or higher privilege (including self).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        actor_rank = get_user_privilege_rank(request.user)
        
        # 1. Resolve the target user object
        if isinstance(obj, User):
            target_user = obj
        else:
            # Handle related objects (e.g., Profile, UserTask, etc.)
            target_user = getattr(obj, 'user', None) or getattr(obj, 'owner', None)

        if not target_user:
            return False

        target_rank = get_user_privilege_rank(target_user)

        # 2. Strict inequality check
        # Returns True only if Actor > Target
        # Returns False if Actor == Target (Equal) or Actor < Target (Lower)
        return actor_rank > target_rank


class IsResidentRole(BasePermission):
    """Allows access only to accounts with the resident role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role_assignments.filter(role=UserRole.RESIDENT).exists()
        )


class IsBoardMemberRole(BasePermission):
    """Allows access only to accounts with the board_member role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role_assignments.filter(role=UserRole.BOARD_MEMBER).exists()
        )


class IsAdministrativeStaffRole(BasePermission):
    """Allows access only to accounts with the administrative_staff role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role_assignments.filter(role=UserRole.ADMINISTRATIVE_STAFF).exists()
        )


class IsUserAdministratorRole(BasePermission):
    """Allows access only to accounts with the user_administrator role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role_assignments.filter(role=UserRole.USER_ADMINISTRATOR).exists()
        )


class IsSelfRole(BasePermission):
    """A user may act on their own account based on role.

    Allows a user to act on their own account if they have the specified role.
    Use this instead of combining role checks with OR/AND logic.
    """

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.id == request.user.id
        )