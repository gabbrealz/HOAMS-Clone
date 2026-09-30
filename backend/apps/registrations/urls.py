from django.urls import path

from apps.registrations import views

app_name = "registrations"

urlpatterns = [
    path("claimable-units/", views.ClaimableUnitListView.as_view(), name="claimable-units"),
    path("apply/", views.ApplicationSubmitView.as_view(), name="application-submit"),
    path("", views.ApplicationListView.as_view(), name="application-list"),
    path("<int:pk>/", views.ApplicationDetailView.as_view(), name="application-detail"),
    path("<int:pk>/id-document/", views.ApplicationIdDocumentView.as_view(), name="application-id-document"),
    path("<int:pk>/approve/", views.ApplicationApproveView.as_view(), name="application-approve"),
    path("<int:pk>/reject/", views.ApplicationRejectView.as_view(), name="application-reject"),
    path("<int:pk>/id-document/", views.SecureApplicationDocumentView.as_view(), name="application-id-document"),
    path("<str:reference_no>/", views.ApplicationByReferenceView.as_view(), name="application-by-reference"),
]