from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncpg
from app.core.database import get_connection
from app.core.security import obter_usuario_do_token

security = HTTPBearer()


async def get_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    conn: asyncpg.Connection = Depends(get_connection)
) -> dict:
    token = credentials.credentials
    
    usuario_email = obter_usuario_do_token(token)
    
    if not usuario_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso expirado",
            headers={"WWW-Authenticate" : "Bearer"}
        )
        
    usuario = await conn.fetchrow(
        """
        SELECT id, nome, email, cep, estado, cidade, foto_perfil,   
            xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
        FROM usuarios WHERE email = $1
        """, 
        usuario_email
    )
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado!"
        )
    
    return dict(usuario)

async def get_usuario_atual_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    conn: asyncpg.Connection = Depends(get_connection)
) -> dict | None:
    if credentials is None:
        return None
        
    try:
        token = credentials.credentials
        usuario_email = obter_usuario_do_token(token)
        
        if not usuario_email:
            return None
            
        usuario = await conn.fetchrow(
            """
            SELECT id, nome, email, cep, estado, cidade, foto_perfil,   
                xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
            FROM usuarios WHERE email = $1
            """, 
            usuario_email
        )
        
        return dict(usuario) if usuario else None
        
    except Exception:
        return None