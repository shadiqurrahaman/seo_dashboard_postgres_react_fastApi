import json
from google.oauth2.credentials import Credentials
from google.cloud import bigquery
from config import settings


def build_bq_client(token_data: dict) -> bigquery.Client:
    creds = Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    )
    return bigquery.Client(credentials=creds, project=token_data.get("project_id"))


def run_bq_query(token_data: dict, query: str) -> list[dict]:
    client = build_bq_client(token_data)
    job = client.query(query)
    rows = job.result()
    return [dict(row) for row in rows]


def bigquery_oauth_url(state: str = "") -> str:
    from auth.utils import google_auth_url, GOOGLE_BQ_SCOPES
    return google_auth_url(settings.google_bq_redirect_uri, GOOGLE_BQ_SCOPES, state=state)
