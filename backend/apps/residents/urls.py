from django.urls import path

from apps.residents import views

app_name = "residents"

urlpatterns = [
    path("", views.ResidentListView.as_view(), name="resident-list"),
    path("<int:pk>/", views.ResidentDetailView.as_view(), name="resident-detail"),
]
