from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import MetricRecord, User
from auth.utils import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90, "qtd": 91, "ytd": 365}


def date_range(range_key: str) -> tuple[datetime, datetime]:
    days = RANGE_DAYS.get(range_key, 30)
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    return start, end


@router.get("/kpis")
async def get_kpis(
    range: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start, end = date_range(range)
    prev_start = start - (end - start)

    async def agg(d_start: datetime, d_end: datetime) -> dict:
        result = await db.execute(
            select(
                func.sum(MetricRecord.clicks).label("clicks"),
                func.sum(MetricRecord.impressions).label("impressions"),
                func.sum(MetricRecord.spend).label("spend"),
                func.sum(MetricRecord.sessions).label("sessions"),
                func.sum(MetricRecord.conversions).label("conversions"),
                func.sum(MetricRecord.revenue).label("revenue"),
            ).where(
                MetricRecord.org_id == user.org_id,
                MetricRecord.date >= d_start,
                MetricRecord.date <= d_end,
            )
        )
        row = result.one()
        return {
            "clicks": float(row.clicks or 0),
            "impressions": float(row.impressions or 0),
            "spend": float(row.spend or 0),
            "sessions": float(row.sessions or 0),
            "conversions": float(row.conversions or 0),
            "revenue": float(row.revenue or 0),
        }

    curr = await agg(start, end)
    prev = await agg(prev_start, start)

    def delta(c, p) -> float:
        if p == 0:
            return 0.0
        return round((c - p) / p * 100, 1)

    def safe_div(a, b, mult=1):
        return round((a / b) * mult, 2) if b else 0.0

    roas_c = safe_div(curr["revenue"], curr["spend"])
    roas_p = safe_div(prev["revenue"], prev["spend"])
    cpa_c = safe_div(curr["spend"], curr["conversions"])
    cpa_p = safe_div(prev["spend"], prev["conversions"])
    cvr_c = safe_div(curr["conversions"], curr["clicks"], 100)
    cvr_p = safe_div(prev["conversions"], prev["clicks"], 100)
    ctr_c = safe_div(curr["clicks"], curr["impressions"], 100)

    has_data = any(curr.values())

    return {
        "has_data": has_data,
        "current": curr,
        "kpis": [
            {"id": "roas", "label": "Return on Ad Spend", "value": f"{roas_c:.2f}×",
             "delta": delta(roas_c, roas_p), "vs": f"vs prev. {range}", "featured": True},
            {"id": "cpa", "label": "Cost per Acquisition", "value": f"${cpa_c:,.2f}",
             "delta": delta(cpa_c, cpa_p), "vs": f"vs prev. {range}", "invert_delta": True},
            {"id": "cvr", "label": "Conversion Rate", "value": f"{cvr_c:.2f}%",
             "delta": delta(cvr_c, cvr_p), "vs": f"vs prev. {range}"},
            {"id": "spend", "label": "Ad Spend", "value": f"${curr['spend']:,.0f}",
             "delta": delta(curr["spend"], prev["spend"]), "vs": f"vs prev. {range}"},
        ],
    }


@router.get("/trend")
async def get_trend(
    range: str = Query("30d"),
    metric: str = Query("spend"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start, end = date_range(range)
    col = {
        "spend": MetricRecord.spend,
        "clicks": MetricRecord.clicks,
        "impressions": MetricRecord.impressions,
        "conversions": MetricRecord.conversions,
    }.get(metric, MetricRecord.spend)

    result = await db.execute(
        select(
            func.date_trunc("day", MetricRecord.date).label("day"),
            func.sum(col).label("value"),
        ).where(
            MetricRecord.org_id == user.org_id,
            MetricRecord.date >= start,
            MetricRecord.date <= end,
        ).group_by("day").order_by("day")
    )
    rows = result.all()
    return [{"date": r.day.strftime("%Y-%m-%d"), "value": float(r.value or 0)} for r in rows]


@router.get("/channels")
async def get_channels(
    range: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start, end = date_range(range)
    result = await db.execute(
        select(
            MetricRecord.channel,
            func.sum(MetricRecord.spend).label("spend"),
            func.sum(MetricRecord.clicks).label("clicks"),
        ).where(
            MetricRecord.org_id == user.org_id,
            MetricRecord.date >= start,
            MetricRecord.date <= end,
            MetricRecord.channel.isnot(None),
        ).group_by(MetricRecord.channel).order_by(func.sum(MetricRecord.spend).desc())
    )
    rows = result.all()
    total_spend = sum(float(r.spend or 0) for r in rows) or 1
    colors = ["#0ea5e9", "#06b6d4", "#0891b2", "#67e8f9", "#a5f3fc", "#cffafe"]
    return [
        {
            "name": r.channel or "Unknown",
            "spend": round(float(r.spend or 0), 2),
            "clicks": round(float(r.clicks or 0), 2),
            "value": round(float(r.spend or 0) / total_spend * 100, 1),
            "color": colors[i % len(colors)],
        }
        for i, r in enumerate(rows)
    ]


@router.get("/campaigns")
async def get_campaigns(
    range: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start, end = date_range(range)
    result = await db.execute(
        select(
            MetricRecord.campaign,
            MetricRecord.channel,
            func.sum(MetricRecord.spend).label("spend"),
            func.sum(MetricRecord.revenue).label("revenue"),
            func.sum(MetricRecord.conversions).label("conversions"),
            func.sum(MetricRecord.clicks).label("clicks"),
        ).where(
            MetricRecord.org_id == user.org_id,
            MetricRecord.date >= start,
            MetricRecord.date <= end,
            MetricRecord.campaign.isnot(None),
        ).group_by(MetricRecord.campaign, MetricRecord.channel)
        .order_by(func.sum(MetricRecord.spend).desc()).limit(20)
    )
    rows = result.all()

    def safe(a, b):
        return round(a / b, 2) if b else 0.0

    return [
        {
            "name": r.campaign,
            "channel": r.channel or "—",
            "spend": round(float(r.spend or 0), 2),
            "roas": safe(float(r.revenue or 0), float(r.spend or 0)),
            "cpa": safe(float(r.spend or 0), float(r.conversions or 0)),
            "cvr": safe(float(r.conversions or 0), float(r.clicks or 0)) * 100,
        }
        for r in rows
    ]
