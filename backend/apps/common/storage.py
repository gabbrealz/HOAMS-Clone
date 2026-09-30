import uuid
from pathlib import Path

from django.conf import settings
from storages.backends.s3 import S3Storage


def get_resident_id_storage():
    """The private Supabase Storage bucket, reached through its S3-compatible API."""
    return S3Storage(
        bucket_name="id-registration",
        endpoint_url=settings.SUPABASE_S3_ENDPOINT_URL,
        region_name=settings.SUPABASE_S3_REGION,
        access_key=settings.SUPABASE_S3_ACCESS_KEY_ID,
        secret_key=settings.SUPABASE_S3_SECRET_ACCESS_KEY,
        signature_version="s3v4",   # Supabase expects Signature Version 4 for presigned URLs
        addressing_style="path",    # Supabase uses path-style S3 URLs
        default_acl=None,           # Supabase's S3 layer rejects ACL headers
        querystring_auth=True,      # url() returns a signed, expiring link
        querystring_expire=settings.ID_DOCUMENT_URL_TTL_SECONDS,
        file_overwrite=False,
    )


def id_document_upload_to(instance, filename):
    # Never trust the client's filename: use a random name, keep only the extension.
    ext = Path(filename).suffix.lower()
    return f"id_documents/{uuid.uuid4().hex}{ext}"