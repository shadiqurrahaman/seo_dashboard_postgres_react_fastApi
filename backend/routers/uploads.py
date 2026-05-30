import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from database import get_db
from models import FileUpload, MetricRecord, User
from schemas import FileUploadOut, ColumnMappingUpdate
from auth.utils import get_current_user
from connectors.file_parser import parse_file, df_to_records
from config import settings

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_TYPES = {"text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                 "application/vnd.ms-excel", "text/plain"}


async def _process_file(upload_id: str, content: bytes, filename: str, org_id: str):
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(FileUpload).where(FileUpload.id == upload_id))
        upload = result.scalar_one_or_none()
        if not upload:
            return
        try:
            df, detected = parse_file(content, filename)
            upload.status = "ready"
            upload.row_count = len(df)
            upload.detected_columns = detected
            upload.column_mapping = {v: k for k, v in detected["detected"].items() if v}
            await db.commit()
        except Exception as e:
            upload.status = "error"
            upload.error_message = str(e)
            await db.commit()


@router.post("/", response_model=FileUploadOut)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fname = file.filename or "upload"
    if not (fname.endswith(".csv") or fname.endswith(".xlsx") or fname.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    content = await file.read()
    file_type = "csv" if fname.endswith(".csv") else "xlsx"

    os.makedirs(settings.upload_dir, exist_ok=True)
    file_id = uuid.uuid4()
    storage_path = os.path.join(settings.upload_dir, f"{file_id}_{fname}")
    with open(storage_path, "wb") as f:
        f.write(content)

    upload = FileUpload(
        id=file_id,
        org_id=user.org_id,
        user_id=user.id,
        filename=fname,
        file_type=file_type,
        storage_path=storage_path,
        status="processing",
    )
    db.add(upload)
    await db.commit()
    await db.refresh(upload)

    background_tasks.add_task(_process_file, str(file_id), content, fname, str(user.org_id))
    return FileUploadOut.model_validate(upload)


@router.get("/", response_model=list[FileUploadOut])
async def list_uploads(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(FileUpload).where(FileUpload.org_id == user.org_id).order_by(FileUpload.created_at.desc())
    )
    return [FileUploadOut.model_validate(u) for u in result.scalars().all()]


@router.patch("/{upload_id}/mapping", response_model=FileUploadOut)
async def update_mapping(
    upload_id: str,
    body: ColumnMappingUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FileUpload).where(FileUpload.id == upload_id, FileUpload.org_id == user.org_id)
    )
    upload = result.scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")

    upload.column_mapping = body.mapping

    # Delete old records for this source and re-ingest
    await db.execute(
        MetricRecord.__table__.delete().where(
            MetricRecord.source_id == upload_id,
            MetricRecord.org_id == user.org_id,
        )
    )

    with open(upload.storage_path, "rb") as f:
        content = f.read()

    from connectors.file_parser import parse_file, df_to_records
    df, _ = parse_file(content, upload.filename)
    records = df_to_records(df, body.mapping, upload_id, str(user.org_id))

    if records:
        await db.execute(insert(MetricRecord), records)

    await db.commit()
    await db.refresh(upload)
    return FileUploadOut.model_validate(upload)
