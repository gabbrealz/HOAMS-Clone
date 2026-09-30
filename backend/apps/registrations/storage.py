from django.conf import settings
from django.core.files.storage import FileSystemStorage


def get_private_storage():
    return FileSystemStorage(location=f"id-registration")