from rest_framework import generics
from apps.residents.serializers import ResidentSerializer
from apps.residents.selectors import get_residents_queryset
from apps.users.permissions import IsSelfRole, IsAdministrativeStaffRole, IsBoardMemberRole


class ResidentListView(generics.ListAPIView):
    """GET: List all residents."""
    serializer_class = ResidentSerializer
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def get_queryset(self):
        return get_residents_queryset()


class ResidentDetailView(generics.RetrieveAPIView):
    """GET: Retrieve a single resident by ID."""
    serializer_class = ResidentSerializer
    permission_classes = [IsSelfRole | IsAdministrativeStaffRole | IsBoardMemberRole]

    def get_queryset(self):
        return get_residents_queryset()