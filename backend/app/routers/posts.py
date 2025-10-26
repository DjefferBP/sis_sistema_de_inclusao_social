# app/routers/posts.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.post_service import PostService
from app.repositories.post_repository import PostRepository
from app.repositories.comment_repository import CommentRepository
from app.repositories.xp_repository import XPRepository
from app.repositories.user_repository import UserRepository
from app.services.xp_service import XPService
from app.models.post import PostCreate, PostResponse

router = APIRouter(prefix="/posts", tags=["posts"])

async def get_post_service(conn: asyncpg.Connection = Depends(get_connection)) -> PostService:
    post_repo = PostRepository(conn)
    comment_repo = CommentRepository(conn)
    xp_repo = XPRepository(conn)
    user_repo = UserRepository(conn)
    xp_service = XPService(xp_repo, user_repo)
    return PostService(post_repo, comment_repo, xp_service, conn)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def criar_post(
    post_data: PostCreate,
    usuario_atual: dict = Depends(get_usuario_atual),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.criar_post(usuario_atual["id"], post_data)

@router.get("/", response_model=dict)
async def listar_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.listar_posts(limit, offset)

@router.get("/{post_id}", response_model=dict)
async def obter_post(
    post_id: int,
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.obter_post_por_id(post_id)

@router.get("/usuario/{user_id}", response_model=dict)
async def listar_posts_usuario(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.listar_posts_usuario(user_id, limit, offset)

@router.get("/categoria/{categoria}", response_model=dict)
async def listar_posts_categoria(
    categoria: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.listar_posts_por_categoria(categoria, limit, offset)

@router.post("/{post_id}/curtir", response_model=dict)
async def curtir_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.curtir_post(post_id, usuario_atual["id"])

@router.post("/{post_id}/descurtir", response_model=dict)
async def descurtir_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.descurtir_post(post_id, usuario_atual["id"])

@router.delete("/{post_id}", response_model=dict)
async def deletar_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.deletar_post(post_id, usuario_atual["id"])

@router.get("/{post_id}/estatisticas", response_model=dict)
async def estatisticas_post(
    post_id: int,
    post_service: PostService = Depends(get_post_service)
):

    return await post_service.get_estatisticas_post(post_id)