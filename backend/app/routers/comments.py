from fastapi import APIRouter, Depends, HTTPException, status, Query
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.comment_service import CommentService
from app.repositories.comment_repository import CommentRepository
from app.repositories.post_repository import PostRepository
from app.repositories.xp_repository import XPRepository
from app.repositories.user_repository import UserRepository
from app.services.xp_service import XPService
from app.models.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/comentarios", tags=["comentarios"])

async def get_comment_service(conn: asyncpg.Connection = Depends(get_connection)) -> CommentService:
    comment_repo = CommentRepository(conn)
    post_repo = PostRepository(conn)
    xp_repo = XPRepository(conn)
    user_repo = UserRepository(conn)
    xp_service = XPService(xp_repo, user_repo)
    return CommentService(comment_repo, post_repo, xp_service, conn)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def criar_comentario(
    comment_data: CommentCreate,
    usuario_atual: dict = Depends(get_usuario_atual),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.criar_comentario(usuario_atual["id"], comment_data)

@router.get("/{comment_id}", response_model=dict)
async def obter_comentario(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.obter_comentario_por_id(comment_id)

@router.get("/post/{post_id}", response_model=dict)
async def listar_comentarios_post(
    post_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.listar_comentarios_por_post(post_id, limit, offset)

@router.get("/usuario/{user_id}", response_model=dict)
async def listar_comentarios_usuario(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.listar_comentarios_usuario(user_id, limit, offset)

@router.post("/{comment_id}/curtir", response_model=dict)
async def curtir_comentario(
    comment_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.curtir_comentario(comment_id, usuario_atual["id"])

@router.post("/{comment_id}/descurtir", response_model=dict)
async def descurtir_comentario(
    comment_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.descurtir_comentario(comment_id, usuario_atual["id"])

@router.delete("/{comment_id}", response_model=dict)
async def deletar_comentario(
    comment_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    comment_service: CommentService = Depends(get_comment_service)
):

    return await comment_service.deletar_comentario(comment_id, usuario_atual["id"])