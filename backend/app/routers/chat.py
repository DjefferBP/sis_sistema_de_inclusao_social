from fastapi import APIRouter, Depends, HTTPException, status, Query
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.chat_service import ChatService
from app.repositories.chat_repository import ChatRepository
from app.repositories.user_repository import UserRepository
from app.repositories.xp_repository import XPRepository
from app.services.xp_service import XPService
from app.models.chat import MensagemCreate

router = APIRouter(prefix="/chat", tags=["chat"])


async def get_chat_service(conn: asyncpg.Connection = Depends(get_connection)) -> ChatService:
    chat_repo = ChatRepository(conn)
    user_repo = UserRepository(conn)
    xp_repo = XPRepository(conn)
    xp_service = XPService(xp_repo, user_repo)
    return ChatService(chat_repo, user_repo, xp_service)

@router.post("/conversas/{usuario2_id}", response_model=dict)
async def iniciar_conversa(
    usuario2_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.iniciar_ou_buscar_conversa(usuario_atual["id"], usuario2_id)

@router.get("/conversas/", response_model=list)
async def listar_conversas(
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.listar_conversas_usuario(usuario_atual["id"])

@router.post("/conversas/{conversa_id}/mensagens", response_model=dict)
async def enviar_mensagem(
    conversa_id: int,
    mensagem_data: MensagemCreate,
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.enviar_mensagem(conversa_id, usuario_atual["id"], mensagem_data)

@router.get("/conversas/{conversa_id}/mensagens", response_model=dict)
async def obter_mensagens_conversa(
    conversa_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.obter_mensagens_conversa(conversa_id, usuario_atual["id"], limit, offset)

@router.get("/conversas/{conversa_id}/completa", response_model=dict)
async def obter_conversa_completa(
    conversa_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.obter_conversa_completa(conversa_id, usuario_atual["id"])

@router.get("/nao-lidas", response_model=dict)
async def obter_nao_lidas_count(
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    return await chat_service.get_nao_lidas_count(usuario_atual["id"])

@router.get("/buscar-conversa/{usuario2_id}", response_model=dict)
async def buscar_conversa_usuarios(
    usuario2_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    chat_service: ChatService = Depends(get_chat_service)
):

    conversa = await chat_service.buscar_conversa_por_usuarios(usuario_atual["id"], usuario2_id)
    if not conversa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada"
        )
    return {"conversa": conversa}