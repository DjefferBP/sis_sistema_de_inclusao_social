import asyncpg
from typing import Optional, List, Dict, Any
from app.models.user import UserCreate, UserResposta
from app.core.security import hash_senha

class UserRepository:
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection
    
    async def get_by_id(self, user_id: int) -> Optional[Dict[str, int]]:
        return await self.conn.fetchrow(
            """SELECT id, nome, email, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios WHERE id = $1""",
            user_id
        )
    
    async def get_by_email(self, user_email: str) -> Optional[dict[str, Any]]:
        return await self.conn.fetchrow(
            """SELECT id, nome, email, senha_hash, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios WHERE email = $1""",
            user_email
        )
    
    async def create(self, user_data: UserCreate) -> Optional[Dict[str, Any]]:
        senha_hash = hash_senha(user_data.senha)
        
        return await self.conn.fetchrow(
            """INSERT INTO usuarios (nome, email, senha_hash, cep, estado, cidade, bio)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, nome, email, cep, estado, cidade, bio, 
                        xp_atual, nivel_atual, created_at""",
            user_data.nome, user_data.email, senha_hash,
            user_data.cep, user_data.estado, user_data.cidade,
            user_data.bio 
        )

    async def update_xp(self, user_id: int, xp_ganho: int) -> Optional[Dict[str, Any]]:
        return await self.conn.fetchrow(
            """UPDATE usuarios 
               SET xp_atual = xp_atual + $1, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $2 
               RETURNING xp_atual, nivel_atual""",
            xp_ganho, user_id
        )
        
    async def update_nivel(self, user_id: int, novo_nivel: int) -> None:
        await self.conn.execute(
            "UPDATE usuarios SET nivel_atual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            novo_nivel, user_id
        )
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            """SELECT id, nome, email, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios 
               ORDER BY created_at DESC 
               LIMIT $1 OFFSET $2""",
            limit, offset
        )
    
    async def delete(self, user_id: int) -> bool:
        result = await self.conn.execute(
            "DELETE FROM usuarios WHERE id = $1",
            user_id
        )
        return "DELETE 1" in result
    
    async def update_titulo_equipado(self, user_id: int, titulo_id: Optional[int]) -> None:
        await self.conn.execute(
            "UPDATE usuarios SET titulo_equipado_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            titulo_id, user_id
        )