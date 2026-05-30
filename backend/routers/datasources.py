import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from database import get_db
from models import DataSource, MetricRecord, User
from schemas import PostgresSourceCreate, BigQuerySourceCreate, DataSourceOut
from auth.utils import get_current_user, exchange_google_code
from connectors.postgres_conn import test_connection, run_query
from connectors.bigquery import bigquery_oauth_url, run_bq_query
from connectors.file_parser import df_to_records
from config import settings
import pandas as pd

router = APIRouter(prefix="/datasources", tags=["datasources"])


@router.get("/", response_model=list[DataSourceOut])
async def list_sources(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(DataSource).where(DataSource.org_id == user.org_id).order_by(DataSource.created_at.desc())
    )
    return [DataSourceOut.model_validate(s) for s in result.scalars().all()]


# ── PostgreSQL ─────────────────────────────────────────────────────────────────
@router.post("/postgres", response_model=DataSourceOut)
async def add_postgres(
    body: PostgresSourceCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        await test_connection(body.host, body.port, body.database, body.username, body.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")

    source = DataSource(
        org_id=user.org_id,
        name=body.name,
        source_type="postgres",
        config={
            "host": body.host, "port": body.port, "database": body.database,
            "username": body.username, "password": body.password, "query": body.query,
        },
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return DataSourceOut.model_validate(source)


@router.post("/postgres/{source_id}/sync", response_model=dict)
async def sync_postgres(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DataSource).where(DataSource.id == source_id, DataSource.org_id == user.org_id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")

    cfg = source.config
    rows = await run_query(cfg["host"], cfg["port"], cfg["database"], cfg["username"], cfg["password"], cfg["query"])
    df = pd.DataFrame(rows)

    from connectors.file_parser import detect_columns, df_to_records
    detected = detect_columns(df)
    mapping = {v: k for k, v in detected["detected"].items() if v}
    records = df_to_records(df, mapping, source_id, str(user.org_id))

    await db.execute(
        MetricRecord.__table__.delete().where(
            MetricRecord.source_id == source_id, MetricRecord.org_id == user.org_id
        )
    )
    if records:
        await db.execute(insert(MetricRecord), records)

    from datetime import datetime
    source.last_synced_at = datetime.utcnow()
    await db.commit()
    return {"synced": len(records)}


# ── BigQuery OAuth ─────────────────────────────────────────────────────────────
@router.get("/bigquery/oauth")
async def bigquery_oauth_start(user: User = Depends(get_current_user)):
    url = bigquery_oauth_url(state=str(user.org_id))
    return {"url": url}


@router.get("/bigquery/callback")
async def bigquery_oauth_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    tokens = await exchange_google_code(code, settings.google_bq_redirect_uri)
    # Store pending token so frontend can complete the setup
    pending = DataSource(
        org_id=state,
        name="BigQuery (pending setup)",
        source_type="bigquery",
        config={"tokens": tokens},
        status="pending",
    )
    db.add(pending)
    await db.commit()
    await db.refresh(pending)
    return RedirectResponse(
        f"{settings.frontend_url}/datasources/bigquery/setup?source_id={pending.id}"
    )


@router.post("/bigquery/{source_id}/configure", response_model=DataSourceOut)
async def configure_bigquery(
    source_id: str,
    body: BigQuerySourceCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DataSource).where(DataSource.id == source_id, DataSource.org_id == user.org_id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")

    tokens = source.config.get("tokens", {})
    tokens["project_id"] = body.project_id
    source.name = body.name
    source.config = {"tokens": tokens, "dataset": body.dataset, "query": body.query}
    source.status = "active"
    await db.commit()
    await db.refresh(source)
    return DataSourceOut.model_validate(source)


@router.post("/bigquery/{source_id}/sync", response_model=dict)
async def sync_bigquery(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DataSource).where(DataSource.id == source_id, DataSource.org_id == user.org_id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")

    cfg = source.config
    rows = run_bq_query(cfg["tokens"], cfg["query"])
    df = pd.DataFrame(rows)

    from connectors.file_parser import detect_columns, df_to_records
    detected = detect_columns(df)
    mapping = {v: k for k, v in detected["detected"].items() if v}
    records = df_to_records(df, mapping, source_id, str(user.org_id))

    await db.execute(
        MetricRecord.__table__.delete().where(
            MetricRecord.source_id == source_id, MetricRecord.org_id == user.org_id
        )
    )
    if records:
        await db.execute(insert(MetricRecord), records)

    from datetime import datetime
    source.last_synced_at = datetime.utcnow()
    await db.commit()
    return {"synced": len(records)}


@router.delete("/{source_id}", response_model=dict)
async def delete_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DataSource).where(DataSource.id == source_id, DataSource.org_id == user.org_id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    await db.delete(source)
    await db.commit()
    return {"deleted": True}
