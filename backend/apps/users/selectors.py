from apps.users.models import User, UserRoleAssignment


def get_user_by_id(*, user_id: int) -> User:
    return User.objects.get(id=user_id)


def get_user_by_email(*, email: str) -> User | None:
    return User.objects.filter(email__iexact=email).first()


def list_users(*, role: str | None = None, status: str | None = None):
    qs = User.objects.all().order_by("email")
    if role:
        qs = qs.filter(role_assignments__role=role)
    if status:
        qs = qs.filter(status=status)
    return qs