from django.db import models


class OccupancyStatus(models.TextChoices):
    OCCUPIED = "occupied", "Occupied"
    VACANT = "vacant", "Vacant"


class Property(models.Model):
    block_and_lot = models.CharField(max_length=20)
    street_address = models.TextField()
    owner = models.ForeignKey(
        "residents.Resident",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="units",
    )
    occupancy_status = models.CharField(max_length=20, choices=OccupancyStatus.choices, default=OccupancyStatus.VACANT)
    is_for_rent = models.BooleanField(default=False)
    rent_listed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"

    def __str__(self):
        return self.block_and_lot