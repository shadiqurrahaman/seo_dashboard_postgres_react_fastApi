import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    org_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    org_id: uuid.UUID

    model_config = {"from_attributes": True}


# ── Data Sources ───────────────────────────────────────────────────────────────
class PostgresSourceCreate(BaseModel):
    name: str
    host: str
    port: int = 5432
    database: str
    username: str
    password: str
    query: str


class BigQuerySourceCreate(BaseModel):
    name: str
    project_id: str
    dataset: str
    query: str


class DataSourceOut(BaseModel):
    id: uuid.UUID
    name: str
    source_type: str
    status: str
    last_synced_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── File Uploads ───────────────────────────────────────────────────────────────
class ColumnMappingUpdate(BaseModel):
    mapping: dict  # { "my_col": "clicks", "spend_usd": "spend", ... }


class FileUploadOut(BaseModel):
    id: uuid.UUID
    filename: str
    file_type: str
    status: str
    row_count: int
    detected_columns: dict
    column_mapping: dict
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ──────────────────────────────────────────────────────────────────
class DashboardFilters(BaseModel):
    range: str = "30d"  # 7d | 30d | 90d | qtd | ytd
    channel: str | None = None
    source_id: str | None = None


class KPIData(BaseModel):
    label: str
    value: str
    delta: float
    vs: str


class TimeSeriesPoint(BaseModel):
    date: str
    value: float


class DashboardData(BaseModel):
    kpis: list[KPIData]
    trend: list[TimeSeriesPoint]
    channels: list[dict]
    top_campaigns: list[dict]
    has_data: bool
