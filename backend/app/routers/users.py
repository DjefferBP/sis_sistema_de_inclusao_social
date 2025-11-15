import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.repositories.xp_repository import XPRepository
from app.models.user import UserUpdate, UserProfileResponse


router = APIRouter(prefix="/usuarios", tags=["usuarios"])

async def get_user_service(conn: asyncpg.Connection = Depends(get_connection)) -> UserService:
    user_repo = UserRepository(conn)
    xp_repo = XPRepository(conn)
    return UserService(user_repo, xp_repo)

@router.get("/me", response_model=UserProfileResponse)
async def obter_perfil_usuario(
    usuario_atual: dict = Depends(get_usuario_atual),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.obter_perfil_usuario(usuario_atual["id"])

@router.put("/me", response_model=UserProfileResponse)
async def atualizar_perfil_usuario(
    user_update: UserUpdate,
    usuario_atual: dict = Depends(get_usuario_atual),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.atualizar_perfil_usuario(usuario_atual["id"], user_update)

@router.get("/{user_id}", response_model=UserProfileResponse)
async def obter_perfil_por_id(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.obter_perfil_usuario(user_id)

@router.get("/", response_model=list)
async def listar_usuarios(
    limit: int = 100,
    offset: int = 0,
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.listar_usuarios(limit, offset)

@router.get("/grupos-vulnerabilidade/disponiveis", response_model=list)
async def listar_grupos_vulnerabilidade_disponiveis(
    conn: asyncpg.Connection = Depends(get_connection)
):
    grupos = await conn.fetch(
        "SELECT id, categoria, tipo FROM grupos_vulnerabilidade ORDER BY categoria, tipo"
    )
    return [dict(grupo) for grupo in grupos]

@router.put("/me/foto", response_model=dict)
async def upload_foto_perfil(
    file: UploadFile = File(...),
    usuario_atual: dict = Depends(get_usuario_atual),
    conn: asyncpg.Connection = Depends(get_connection)
):
    if not file.content_type or not file.content_type.startswith('image/'): 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo deve ser uma imagem"
        )

    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A imagem deve ter no máximo 5MB"
        )

    foto_base64 = base64.b64encode(contents).decode('utf-8')

    user_repo = UserRepository(conn)
    await conn.execute(
        "UPDATE usuarios SET foto_perfil = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        foto_base64, usuario_atual["id"]
    )
    
    return {
        "mensagem": "Foto de perfil atualizada com sucesso!",
        "tamanho": len(contents),
        "formato": file.content_type
    }

@router.delete("/me/foto", response_model=dict)
async def remover_foto_perfil(
    usuario_atual: dict = Depends(get_usuario_atual),
    conn: asyncpg.Connection = Depends(get_connection)
):
    await conn.execute(
        "UPDATE usuarios SET foto_perfil = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        usuario_atual["id"]
    )
    
    return {"mensagem": "Foto de perfil removida com sucesso!"}

@router.get("/me/foto", response_model=dict)
async def obter_foto_perfil(
    usuario_atual: dict = Depends(get_usuario_atual),
    conn: asyncpg.Connection = Depends(get_connection)
):
    user_repo = UserRepository(conn)
    usuario = await user_repo.get_by_id(usuario_atual["id"])
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {
        "tem_foto": usuario.get("foto_perfil") is not None,
        "foto_base64": usuario.get("foto_perfil")
    }