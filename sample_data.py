import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_traffic_data(days=90):
    dates = [datetime.today() - timedelta(days=i) for i in range(days)]
    dates.reverse()
    np.random.seed(42)
    base = 1200
    trend = np.linspace(0, 300, days)
    noise = np.random.normal(0, 80, days)
    sessions = (base + trend + noise).astype(int).clip(min=100)
    clicks = (sessions * np.random.uniform(0.6, 0.85, days)).astype(int)
    impressions = (sessions * np.random.uniform(8, 14, days)).astype(int)
    ctr = (clicks / impressions * 100).round(2)
    avg_position = np.random.uniform(8, 18, days).round(1)
    return pd.DataFrame({
        "date": dates,
        "sessions": sessions,
        "clicks": clicks,
        "impressions": impressions,
        "ctr": ctr,
        "avg_position": avg_position,
    })

def generate_top_pages():
    pages = [
        "/blog/seo-strategy-2025",
        "/services/data-analytics",
        "/blog/google-ads-attribution",
        "/case-studies/ecommerce-seo",
        "/blog/hubspot-pipeline",
        "/services/web-analytics",
        "/blog/dbt-tutorial",
        "/about",
        "/blog/snowflake-vs-bigquery",
        "/contact",
    ]
    np.random.seed(7)
    clicks = np.random.randint(300, 4000, len(pages))
    impressions = (clicks * np.random.uniform(8, 20, len(pages))).astype(int)
    ctr = (clicks / impressions * 100).round(2)
    position = np.random.uniform(1.5, 18, len(pages)).round(1)
    return pd.DataFrame({
        "page": pages,
        "clicks": clicks,
        "impressions": impressions,
        "ctr": ctr,
        "avg_position": position,
    }).sort_values("clicks", ascending=False).reset_index(drop=True)

def generate_top_queries():
    queries = [
        "seo dashboard for marketing teams",
        "data pipeline google ads snowflake",
        "hubspot salesforce integration",
        "marketing attribution model",
        "dbt tutorial beginners",
        "google analytics 4 migration",
        "airbyte vs fivetran comparison",
        "b2b seo strategy 2025",
        "data engineering agency",
        "marketing data warehouse setup",
    ]
    np.random.seed(13)
    clicks = np.random.randint(80, 1800, len(queries))
    impressions = (clicks * np.random.uniform(10, 25, len(queries))).astype(int)
    ctr = (clicks / impressions * 100).round(2)
    position = np.random.uniform(1.2, 22, len(queries)).round(1)
    return pd.DataFrame({
        "query": queries,
        "clicks": clicks,
        "impressions": impressions,
        "ctr": ctr,
        "avg_position": position,
    }).sort_values("clicks", ascending=False).reset_index(drop=True)

def generate_channel_breakdown():
    return pd.DataFrame({
        "channel": ["Organic Search", "Direct", "Referral", "Social", "Email", "Paid Search"],
        "sessions": [5800, 2100, 980, 740, 620, 430],
        "conversions": [124, 61, 29, 18, 44, 38],
    })
