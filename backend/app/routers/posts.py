from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
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
from app.core.dependencies import get_usuario_atual, get_usuario_atual_optional 
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
    usuario_atual: Optional[dict] = Depends(get_usuario_atual_optional),  # ✅ Usa dependência opcional
    post_service: PostService = Depends(get_post_service)
):
    user_id = usuario_atual["id"] if usuario_atual else None
    return await post_service.listar_posts(limit, offset, user_id)

@router.get("/{post_id}", response_model=dict)
async def obter_post(
    post_id: int,
    usuario_atual: Optional[dict] = Depends(get_usuario_atual_optional),  # ✅ Usa dependência opcional
    post_service: PostService = Depends(get_post_service)
):
    try:
        user_id = usuario_atual["id"] if usuario_atual else None
        result = await post_service.obter_post_por_id(post_id, user_id)
        print("🔍 DEBUG - Tipo do resultado:", type(result))
        print("🔍 DEBUG - Conteúdo do resultado:", result)
        return result
    except Exception as e:
        print("🔴 ERRO na rota:", str(e))
        raise

@router.get("/usuario/{user_id}", response_model=dict)
async def listar_posts_usuario(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    usuario_atual: Optional[dict] = Depends(get_usuario_atual_optional),  # ✅ Usa dependência opcional
    post_service: PostService = Depends(get_post_service)
):
    current_user_id = usuario_atual["id"] if usuario_atual else None
    return await post_service.listar_posts_usuario(user_id, limit, offset, current_user_id)

@router.get("/categoria/{categoria}", response_model=dict)
async def listar_posts_categoria(
    categoria: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    usuario_atual: Optional[dict] = Depends(get_usuario_atual_optional),  # ✅ Usa dependência opcional
    post_service: PostService = Depends(get_post_service)
):
    user_id = usuario_atual["id"] if usuario_atual else None
    return await post_service.listar_posts_por_categoria(categoria, limit, offset, user_id)

@router.post("/{post_id}/curtir", response_model=dict)
async def curtir_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),  # ✅ Mantém obrigatório
    post_service: PostService = Depends(get_post_service)
):
    return await post_service.curtir_post(post_id, usuario_atual["id"])

@router.post("/{post_id}/descurtir", response_model=dict)
async def descurtir_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),  # ✅ Mantém obrigatório
    post_service: PostService = Depends(get_post_service)
):
    return await post_service.descurtir_post(post_id, usuario_atual["id"])

@router.delete("/{post_id}", response_model=dict)
async def deletar_post(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual),  # ✅ Mantém obrigatório
    post_service: PostService = Depends(get_post_service)
):
    return await post_service.deletar_post(post_id, usuario_atual["id"])

@router.get("/{post_id}/estatisticas", response_model=dict)
async def estatisticas_post(
    post_id: int,
    post_service: PostService = Depends(get_post_service)
):
    return await post_service.get_estatisticas_post(post_id)

@router.get("/{post_id}/curtido", response_model=dict)
async def verificar_curtida(
    post_id: int,
    usuario_atual: dict = Depends(get_usuario_atual), 
    post_service: PostService = Depends(get_post_service)
):
    curtido = await post_service.post_repo.check_user_liked_post(post_id, usuario_atual["id"])
    return {"curtido": curtido}