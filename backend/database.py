from urllib.parse import urlparse, parse_qs
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import settings


def _normalize_db_url(raw: str) -> tuple[str, dict]:
    """Neon / managed-postgres URLs include `?sslmode=require` and similar
    query params that asyncpg does not understand. Strip them and translate
    to asyncpg's `ssl` connect_arg.
    """
    url = raw
    # Ensure async driver
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    connect_args: dict = {}
    if "sslmode" in qs and qs["sslmode"][0] in ("require", "verify-ca", "verify-full"):
        connect_args["ssl"] = True

    # Drop all query params (asyncpg rejects unknown ones)
    base_url = url.split("?", 1)[0]
    return base_url, connect_args


_db_url, _connect_args = _normalize_db_url(settings.database_url)
engine = create_async_engine(_db_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    from models import Org, User, DataSource, FileUpload, MetricRecord  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
