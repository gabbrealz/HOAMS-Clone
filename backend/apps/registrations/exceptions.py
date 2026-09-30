from rest_framework import status
from rest_framework.exceptions import APIException


class ApplicationConflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "This action conflicts with the current state of the application."
    default_code = "application_conflict"