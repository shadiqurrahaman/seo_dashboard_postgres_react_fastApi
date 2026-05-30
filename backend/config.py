from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://growmos:growmos@postgres:5432/growmos"
    secret_key: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    google_bq_redirect_uri: str = "http://localhost:8000/datasources/bigquery/callback"

    frontend_url: str = "http://localhost:5173"
    upload_dir: str = "/app/uploads"


settings = Settings()
