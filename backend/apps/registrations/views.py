from django.http import FileResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.users.models import UserRole
from apps.registrations.models import RegistrationApplication
from apps.registrations.selectors import get_application, list_applications, list_claimable_properties
from apps.registrations.serializers import (
    ApplicationReceiptSerializer,
    ApplicationSerializer,
    ApplicationSubmitSerializer,
    ClaimablePropertySerializer,
    RejectSerializer,
)
from apps.registrations.services import (
    approve_application,
    reject_application,
    submit_application,
)
from apps.users.permissions import (
    RequireHigherPrivilege,
    IsBoardMemberRole,
    IsAdministrativeStaffRole,
    IsUserAdministratorRole
)


class ApplicationByReferenceView(APIView):
    """Get application by reference_no. Public endpoint."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, reference_no):
        try:
            application = RegistrationApplication.objects.get(reference_no=reference_no)
            serializer = ApplicationReceiptSerializer(application)
            return Response(serializer.data)
        except RegistrationApplication.DoesNotExist:
            return Response(
                {"error": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class ClaimableUnitListView(generics.ListAPIView):
    # Public. Exposes only id and unit_number of units that have no owner.
    serializer_class = ClaimablePropertySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    pagination_class = None

    def get_queryset(self):
        return list_claimable_properties()


class ApplicationSubmitView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser]
    # throttle_classes = [ScopedRateThrottle]
    # throttle_scope = "registration_submit"

    def post(self, request):
        serializer = ApplicationSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = submit_application(**serializer.validated_data)
        return Response(
            ApplicationReceiptSerializer(application).data, status=status.HTTP_201_CREATED
        )


class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def get_queryset(self):
        return list_applications(status=self.request.query_params.get("status"))


class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def get_object(self):
        return get_application(application_id=self.kwargs["pk"])


class ApplicationIdDocumentView(APIView):
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def get(self, request, pk):
        application = get_application(application_id=pk)
        response = FileResponse(application.id_document.open("rb"))
        response["Cache-Control"] = "private, no-store"
        return response


class ApplicationApproveView(APIView):
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def post(self, request, pk):
        application = approve_application(application_id=pk, reviewer=request.user)
        return Response(ApplicationSerializer(application, context={"request": request}).data)


class ApplicationRejectView(APIView):
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def post(self, request, pk):
        serializer = RejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = reject_application(
            application_id=pk,
            reviewer=request.user,
            reason=serializer.validated_data["reason"],
        )
        return Response(ApplicationSerializer(application, context={"request": request}).data)


class SecureApplicationDocumentView(APIView):
    permission_classes = [IsAdministrativeStaffRole | IsBoardMemberRole]

    def get(self, request, pk):
        # 1. Fetch application
        application = get_object_or_404(RegistrationApplication, pk=pk)

        if not application.id_document:
            return Response(
                {"detail": "No document associated with this application."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2. Generate short-lived signed URL (e.g. 60 seconds)
        file_storage = application.id_document.storage
        signed_url = file_storage.url(application.id_document.name, expire=60)

        # 3. Redirect browser to Supabase CDN
        return HttpResponseRedirect(signed_url)