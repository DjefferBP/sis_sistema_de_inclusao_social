from fastapi import APIRouter, Depends
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.xp_service import XPService
from app.repositories.xp_repository import XPRepository
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/xp", tags=["sistema-xp"])

async def get_xp_service(conn: asyncpg.Connection = Depends(get_connection)) -> XPService:
    xp_repo = XPRepository(conn)
    user_repo = UserRepository(conn)
    return XPService(xp_repo, user_repo)

@router.get("/progresso", response_model=dict)
async def obter_progresso_usuario(
    usuario_atual: dict = Depends(get_usuario_atual),
    xp_service: XPService = Depends(get_xp_service)
):

    return await xp_service.get_progresso_usuario(usuario_atual["id"])

@router.get("/historico", response_model=list)
async def obter_historico_xp(
    usuario_atual: dict = Depends(get_usuario_atual),
    limit: int = 50,
    xp_service: XPService = Depends(get_xp_service)
):
    return await xp_service.get_historico_xp_usuario(usuario_atual["id"], limit)

@router.get("/niveis", response_model=list)
async def listar_niveis_titulos(
    xp_service: XPService = Depends(get_xp_service)
):
    return await xp_service.get_todos_niveis_titulos()

@router.post("/titulos/{titulo_id}/equipar", response_model=dict)
async def equipar_titulo(
    titulo_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    xp_service: XPService = Depends(get_xp_service)
):
    return await xp_service.equipar_titulo(usuario_atual["id"], titulo_id)

@router.post("/titulos/remover", response_model=dict)
async def remover_titulo_equipado(
    usuario_atual: dict = Depends(get_usuario_atual),
    xp_service: XPService = Depends(get_xp_service)
):

    return await xp_service.remover_titulo_equipado(usuario_atual["id"])

@router.get("/proximo-nivel", response_model=dict)
async def calcular_xp_proximo_nivel(
    usuario_atual: dict = Depends(get_usuario_atual),
    xp_service: XPService = Depends(get_xp_service)
):
    return await xp_service.calcular_xp_para_proximo_nivel(usuario_atual["id"])