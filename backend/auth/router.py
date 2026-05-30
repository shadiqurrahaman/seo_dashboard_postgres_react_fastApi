import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User, Org
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from auth.utils import (
    hash_password, verify_password, create_access_token,
    get_current_user, google_auth_url, exchange_google_code,
    get_google_userinfo, GOOGLE_LOGIN_SCOPES,
)
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    org = Org(name=body.org_name)
    db.add(org)
    await db.flush()

    user = User(
        org_id=org.id,
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        role="admin",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id), str(user.org_id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user.id), str(user.org_id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/google")
async def google_login():
    url = google_auth_url(settings.google_redirect_uri, GOOGLE_LOGIN_SCOPES)
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    tokens = await exchange_google_code(code, settings.google_redirect_uri)
    info = await get_google_userinfo(tokens["access_token"])

    email = info.get("email")
    google_id = info.get("sub")
    name = info.get("name", email)

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        org = Org(name=f"{name}'s Workspace")
        db.add(org)
        await db.flush()
        user = User(org_id=org.id, email=email, name=name, google_id=google_id, role="admin")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        await db.commit()

    token = create_access_token(str(user.id), str(user.org_id))
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)
