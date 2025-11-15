import asyncpg
from typing import Optional, List, Dict, Any
from app.models.post import PostCreate

class PostRepository: 
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection

    async def create(self, user_id: int, post_data: PostCreate) -> Optional[Dict[str, Any]]:
        result =  await self.conn.fetchrow(
            """INSERT INTO posts (usuario_id, titulo, conteudo, categoria)
               VALUES ($1, $2, $3, $4)
               RETURNING id, usuario_id, titulo, conteudo, categoria, 
                         curtidas_count, comentarios_count, created_at, updated_at""",
            user_id, post_data.titulo, post_data.conteudo, post_data.categoria
        )
        return dict(result) if result else None

    async def get_by_id(self, post_id: int) -> Optional[Dict[str, Any]]:
        result = await self.conn.fetchrow(
            """SELECT p.id, p.titulo, p.conteudo, p.categoria, p.usuario_id,
                      p.curtidas_count, p.comentarios_count, p.created_at, p.updated_at,
                      u.nome as autor_nome
               FROM posts p
               JOIN usuarios u ON p.usuario_id = u.id
               WHERE p.id = $1""",
            post_id
        )
        return dict(result) if result else None
        

    async def get_all(self, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        result = await self.conn.fetch(
            """SELECT p.id, p.titulo, p.conteudo, p.categoria, p.usuario_id,
                      p.curtidas_count, p.comentarios_count, p.created_at, p.updated_at,
                      u.nome as autor_nome
               FROM posts p
               JOIN usuarios u ON p.usuario_id = u.id
               ORDER BY p.created_at DESC
               LIMIT $1 OFFSET $2""",
            limit, offset
        )
        return [dict(record) for record in result]

    async def get_by_user_id(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        result = await self.conn.fetch(
            """SELECT p.id, p.titulo, p.conteudo, p.categoria, p.usuario_id,
                      p.curtidas_count, p.comentarios_count, p.created_at, p.updated_at,
                      u.nome as autor_nome
               FROM posts p
               JOIN usuarios u ON p.usuario_id = u.id
               WHERE p.usuario_id = $1
               ORDER BY p.created_at DESC
               LIMIT $2 OFFSET $3""",
            user_id, limit, offset
        )
        return [dict(record) for record in result]

    async def get_by_categoria(self, categoria: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        result = await self.conn.fetch(
            """SELECT p.id, p.titulo, p.conteudo, p.categoria, p.usuario_id,
                      p.curtidas_count, p.comentarios_count, p.created_at, p.updated_at,
                      u.nome as autor_nome
               FROM posts p
               JOIN usuarios u ON p.usuario_id = u.id
               WHERE p.categoria = $1
               ORDER BY p.created_at DESC
               LIMIT $2 OFFSET $3""",
            categoria, limit, offset
        )
        return [dict(record) for record in result]

    async def incrementar_curtidas(self, post_id: int) -> Optional[Dict[str, Any]]:
        result =  await self.conn.fetchrow(
            """UPDATE posts 
               SET curtidas_count = curtidas_count + 1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING curtidas_count""",
            post_id
        )
        return dict(result) if result else None

    async def decrementar_curtidas(self, post_id: int) -> Optional[Dict[str, Any]]:

        result = await self.conn.fetchrow(
            """UPDATE posts 
               SET curtidas_count = GREATEST(0, curtidas_count - 1), updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING curtidas_count""",
            post_id
        )
        return dict(result) if result else None

    async def incrementar_comentarios(self, post_id: int) -> Optional[Dict[str, Any]]:

        result = await self.conn.fetchrow(
            """UPDATE posts 
               SET comentarios_count = comentarios_count + 1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING comentarios_count""",
            post_id
        )
        return dict(result) if result else None

    async def decrementar_comentarios(self, post_id: int) -> Optional[Dict[str, Any]]:

        result = await self.conn.fetchrow(
            """UPDATE posts 
               SET comentarios_count = GREATEST(0, comentarios_count - 1), updated_at = CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING comentarios_count""",
            post_id
        )
        return dict(result) if result else None

    async def delete(self, post_id: int, user_id: int) -> bool:

        result = await self.conn.execute(
            "DELETE FROM posts WHERE id = $1 AND usuario_id = $2",
            post_id, user_id
        )
        return "DELETE 1" in result

    async def count_all(self) -> Optional[int]:
        result =  await self.conn.fetchval("SELECT COUNT(*) FROM posts")
        return int(result) if result else None
    
    # No PostRepository, modifique o método check_user_liked_post:

    async def check_user_liked_post(self, post_id: int, user_id: Optional[int] = None) -> bool:
        if user_id is None:
            return False
            
        try:
            result = await self.conn.fetchval(
                "SELECT 1 FROM post_curtidas WHERE post_id = $1 AND usuario_id = $2",
                post_id, user_id
            )
            return bool(result)
        except Exception as e:
            print(f"Erro ao verificar curtida: {e}")
            return False