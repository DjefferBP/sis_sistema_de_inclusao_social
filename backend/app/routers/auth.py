# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
import asyncpg
from app.core.database import get_connection
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.repositories.xp_repository import XPRepository
from app.models.user import UserCreate, UserLogin, UserResposta

router = APIRouter(prefix="/auth", tags=["autenticacao"])

async def get_user_service(conn: asyncpg.Connection = Depends(get_connection)) -> UserService:
    user_repo = UserRepository(conn)
    xp_repo = XPRepository(conn)
    return UserService(user_repo, xp_repo)

@router.post("/registrar", response_model=dict, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):

    return await user_service.registrar_usuario(user_data)

@router.post("/login", response_model=dict)
async def login_usuario(
    login_data: UserLogin,
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.autenticar_usuario(login_data)