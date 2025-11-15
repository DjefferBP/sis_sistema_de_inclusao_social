import asyncpg
from typing import Optional, List, Dict, Any
from app.models.comment import CommentCreate

class CommentRepository:
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection

    async def create(self, user_id: int, comment_data: CommentCreate) -> Optional[Dict[str, Any]]:
        result = await self.conn.fetchrow(
            """INSERT INTO comentarios (usuario_id, post_id, conteudo)
               VALUES ($1, $2, $3)
               RETURNING id, usuario_id, post_id, conteudo, 
                         curtidas_count, created_at, updated_at""",
            user_id, comment_data.post_id, comment_data.conteudo
        )
        return dict(result) if result else None
    
    async def get_by_id(self, comment_id: int) -> Optional[Dict[str, Any]]:
        result = await self.conn.fetchrow(
            """SELECT c.id, c.conteudo, c.usuario_id, c.post_id,
                      c.curtidas_count, c.created_at, c.updated_at,
                      u.nome as autor_nome
               FROM comentarios c
               JOIN usuarios u ON c.usuario_id = u.id
               WHERE c.id = $1""",
            comment_id
        )
        return dict(result) if result else None

    async def get_by_post_id(self, post_id: int, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        result = await self.conn.fetch(
            """SELECT c.id, c.conteudo, c.usuario_id, c.post_id,
                      c.curtidas_count, c.created_at, c.updated_at,
                      u.nome as autor_nome
               FROM comentarios c
               JOIN usuarios u ON c.usuario_id = u.id
               WHERE c.post_id = $1
               ORDER BY c.created_at ASC
               LIMIT $2 OFFSET $3""",
            post_id, limit, offset
        )
        return [dict(record) for record in result]

    async def get_by_user_id(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:

        result = await self.conn.fetch(
            """SELECT c.id, c.conteudo, c.usuario_id, c.post_id,
                      c.curtidas_count, c.created_at, c.updated_at,
                      u.nome as autor_nome, p.titulo as post_titulo
               FROM comentarios c
               JOIN usuarios u ON c.usuario_id = u.id
               JOIN posts p ON c.post_id = p.id
               WHERE c.usuario_id = $1
               ORDER BY c.created_at DESC
               LIMIT $2 OFFSET $3""",
            user_id, limit, offset
        )
        return [dict(record) for record in result]

    async def incrementar_curtidas(self, comment_id: int) -> Optional[Dict[str, Any]]:

        result = await self.conn.fetchrow(
            """UPDATE comentarios 
               SET curtidas_count = curtidas_count + 1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING curtidas_count""",
            comment_id
        )
        return dict(result) if result else None

    async def decrementar_curtidas(self, comment_id: int) -> Optional[Dict[str, Any]]:
        result = await self.conn.fetchrow(
            """UPDATE comentarios 
               SET curtidas_count = GREATEST(0, curtidas_count - 1), updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING curtidas_count""",
            comment_id
        )
        return dict(result) if result else None

    async def delete(self, comment_id: int, user_id: int) -> bool:
        result = await self.conn.execute(
            "DELETE FROM comentarios WHERE id = $1 AND usuario_id = $2",
            comment_id, user_id
        )
        return "DELETE 1" in result

    async def count_by_post(self, post_id: int) -> Optional[int]:

        result = await self.conn.fetchval(
            "SELECT COUNT(*) FROM comentarios WHERE post_id = $1",
            post_id
        )
        return int(result) if result else None