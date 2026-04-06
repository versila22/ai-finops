from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import (
    AuthRequest,
    TokenResponse,
    UserResponse,
    authenticate_user,
    create_access_token,
    create_user,
)
from app.core.db import get_db

router = APIRouter()


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthRequest, db: Session = Depends(get_db)):
    user = create_user(db, payload.email, payload.password)
    return UserResponse.model_validate(user)


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: AuthRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.email)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
