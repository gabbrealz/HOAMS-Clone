from typing import Optional
from django.db.models import QuerySet
from apps.residents.models import Resident


def get_residents_queryset() -> QuerySet[Resident]:
    """Base queryset for residents with user and unit eager-loaded."""
    return Resident.objects.select_related("user", "unit")


def get_resident_by_id(*, resident_id: int) -> Optional[Resident]:
    """Retrieve a resident by ID or return None for domain/service usage."""
    try:
        return get_residents_queryset().get(pk=resident_id)
    except Resident.DoesNotExist:
        return None