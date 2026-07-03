"""Router de autenticación."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import authenticate_user, create_access_token, get_current_user
from app.models.entities import User

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse, summary="Login con email y password")
async def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Autentica al usuario y retorna un JWT."""
    user = authenticate_user(db, request.email, request.password)
    token = create_access_token(user)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse, summary="Obtener usuario actual")
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Retorna la información del usuario autenticado."""
    return UserResponse.model_validate(current_user)
