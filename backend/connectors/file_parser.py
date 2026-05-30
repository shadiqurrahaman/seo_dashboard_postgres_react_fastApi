import io
import pandas as pd
from datetime import datetime

COLUMN_MAP = {
    "date":        ["date", "day", "week", "month", "time", "timestamp", "period", "report_date"],
    "channel":     ["channel", "source", "medium", "platform", "network"],
    "campaign":    ["campaign", "campaign_name", "ad_campaign", "name"],
    "clicks":      ["clicks", "click", "ad_clicks", "link_clicks"],
    "impressions": ["impressions", "impression", "impr", "views", "reach"],
    "spend":       ["spend", "cost", "ad_spend", "budget", "amount_spent", "cost_usd"],
    "sessions":    ["sessions", "visits", "users", "traffic", "pageviews"],
    "conversions": ["conversions", "conversion", "orders", "purchases", "leads"],
    "revenue":     ["revenue", "income", "sales", "amount", "value", "gmv"],
}


def detect_columns(df: pd.DataFrame) -> dict:
    normalized = {c: c.lower().strip().replace(" ", "_") for c in df.columns}
    detected: dict[str, str | None] = {k: None for k in COLUMN_MAP}
    for col, norm in normalized.items():
        for metric, aliases in COLUMN_MAP.items():
            if norm in aliases and detected[metric] is None:
                detected[metric] = col
    return {
        "raw_columns": list(df.columns),
        "detected": detected,
        "sample": df.head(3).fillna("").to_dict(orient="records"),
    }


def parse_file(content: bytes, filename: str) -> tuple[pd.DataFrame, dict]:
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    else:
        df = pd.read_excel(io.BytesIO(content))

    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all")
    return df, detect_columns(df)


def df_to_records(df: pd.DataFrame, mapping: dict, source_id: str, org_id: str) -> list[dict]:
    inv = {v: k for k, v in mapping.items() if v}
    records = []
    for _, row in df.iterrows():
        rec: dict = {"org_id": org_id, "source_id": source_id, "extra": {}}
        for raw_col, value in row.items():
            metric = inv.get(raw_col)
            if metric == "date":
                try:
                    rec["date"] = pd.to_datetime(value)
                except Exception:
                    rec["date"] = None
            elif metric in {"clicks", "impressions", "spend", "sessions", "conversions", "revenue"}:
                try:
                    rec[metric] = float(str(value).replace(",", "").replace("$", ""))
                except Exception:
                    rec[metric] = None
            elif metric in {"channel", "campaign"}:
                rec[metric] = str(value) if pd.notna(value) else None
            else:
                if pd.notna(value):
                    rec["extra"][raw_col] = str(value)
        records.append(rec)
    return records
