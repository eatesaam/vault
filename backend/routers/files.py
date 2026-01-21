import os
import hashlib
from datetime import datetime, timedelta
from uuid import uuid4
from urllib.parse import unquote
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from azure.storage.blob import BlobServiceClient, ContentSettings

router = APIRouter(prefix="/api/files", tags=["files"])

AZURE_STORAGE_ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT")
AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER_APP_ASSET")
AZURE_STORAGE_SAS = os.getenv("AZURE_STORAGE_SAS")
USER_ID = os.getenv("USER_ID", "default_user")
APP_ID = os.getenv("APP_ID", "default_app")

_blob_cache = {}
_cache_expiry = {}
CACHE_TTL_SECONDS = 3600

def get_blob_service_client():
    if not all([AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_CONTAINER, AZURE_STORAGE_SAS]):
        raise HTTPException(status_code=503, detail="Azure Blob Storage not configured.")
    account_url = f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net"
    return BlobServiceClient(account_url=account_url, credential=AZURE_STORAGE_SAS)

def get_from_cache(cache_key: str):
    if cache_key in _blob_cache:
        expiry = _cache_expiry.get(cache_key)
        if expiry and datetime.utcnow() < expiry:
            return _blob_cache[cache_key]
        _blob_cache.pop(cache_key, None)
        _cache_expiry.pop(cache_key, None)
    return None

def save_to_cache(cache_key: str, data: bytes, content_type: str):
    _blob_cache[cache_key] = (data, content_type)
    _cache_expiry[cache_key] = datetime.utcnow() + timedelta(seconds=CACHE_TTL_SECONDS)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    file_name = f"{uuid4()}{ext}"
    blob_path = f"{USER_ID}/{APP_ID}/images/{file_name}"
    
    blob_client = get_blob_service_client().get_blob_client(
        container=AZURE_STORAGE_CONTAINER, blob=blob_path
    )
    content_type = file.content_type or "image/jpeg"
    content_settings = ContentSettings(content_type=content_type)
    blob_client.upload_blob(contents, overwrite=True, content_settings=content_settings)
    
    return {"blob_path": blob_path}

@router.get("/{blob_path:path}")
async def get_file(blob_path: str):
    decoded_path = unquote(blob_path)
    cache_key = hashlib.md5(decoded_path.encode()).hexdigest()
    
    cached = get_from_cache(cache_key)
    if cached:
        contents, content_type = cached
        return Response(
            content=contents,
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={os.path.basename(decoded_path)}",
                "Cache-Control": "public, max-age=3600",
                "X-Cache": "HIT",
            },
        )
    
    blob_client = get_blob_service_client().get_blob_client(
        container=AZURE_STORAGE_CONTAINER, blob=decoded_path
    )
    
    if not blob_client.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {decoded_path}")
    
    blob_data = blob_client.download_blob()
    contents = blob_data.readall()
    props = blob_client.get_blob_properties()
    content_type = props.content_settings.content_type or "application/octet-stream"
    
    save_to_cache(cache_key, contents, content_type)
    
    return Response(
        content=contents,
        media_type=content_type,
        headers={
            "Content-Disposition": f"inline; filename={os.path.basename(decoded_path)}",
            "Cache-Control": "public, max-age=3600",
            "X-Cache": "MISS",
        },
    )