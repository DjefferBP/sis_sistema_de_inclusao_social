import asyncpg
from typing import Optional, List, Dict, Any
from app.models.chat import ConversaBase, MensagemCreate

class ChatRepository:
    
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection

    async def get_or_create_conversa(self, usuario1_id: int, usuario2_id: int) -> Optional[Dict[str, Any]]:
        user1, user2 = sorted([usuario1_id, usuario2_id])

        conversa = await self.conn.fetchrow(
            """SELECT id, usuario1_id, usuario2_id, data_criacao, ultima_mensagem, created_at
               FROM conversas 
               WHERE usuario1_id = $1 AND usuario2_id = $2""",
            user1, user2
        )
        
        if conversa:
            return conversa

        return await self.conn.fetchrow(
            """INSERT INTO conversas (usuario1_id, usuario2_id)
               VALUES ($1, $2)
               RETURNING id, usuario1_id, usuario2_id, data_criacao, ultima_mensagem, created_at""",
            user1, user2
        )

    async def get_conversas_usuario(self, user_id: int) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            """SELECT c.id, c.usuario1_id, c.usuario2_id, c.data_criacao, c.ultima_mensagem, c.created_at,
                      CASE 
                          WHEN c.usuario1_id = $1 THEN u2.id
                          ELSE u1.id
                      END as outro_usuario_id,
                      CASE 
                          WHEN c.usuario1_id = $1 THEN u2.nome
                          ELSE u1.nome
                      END as outro_usuario_nome
               FROM conversas c
               JOIN usuarios u1 ON c.usuario1_id = u1.id
               JOIN usuarios u2 ON c.usuario2_id = u2.id
               WHERE c.usuario1_id = $1 OR c.usuario2_id = $1
               ORDER BY c.ultima_mensagem DESC NULLS LAST, c.created_at DESC""",
            user_id
        )

    async def criar_mensagem(self, conversa_id: int, remetente_id: int, mensagem_data: MensagemCreate) -> Optional[Dict[str, Any]]:
        async with self.conn.transaction():

            mensagem = await self.conn.fetchrow(
                """INSERT INTO mensagens (conversa_id, remetente_id, mensagem)
                   VALUES ($1, $2, $3)
                   RETURNING id, conversa_id, remetente_id, mensagem, data_envio, lida, created_at""",
                conversa_id, remetente_id, mensagem_data.mensagem
            )

            await self.conn.execute(
                "UPDATE conversas SET ultima_mensagem = CURRENT_TIMESTAMP WHERE id = $1",
                conversa_id
            )
            
            return mensagem

    async def get_mensagens_conversa(self, conversa_id: int, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            """SELECT m.id, m.conversa_id, m.remetente_id, m.mensagem, m.data_envio, m.lida, m.created_at,
                      u.nome as remetente_nome
               FROM mensagens m
               JOIN usuarios u ON m.remetente_id = u.id
               WHERE m.conversa_id = $1
               ORDER BY m.data_envio ASC
               LIMIT $2 OFFSET $3""",
            conversa_id, limit, offset
        )

    async def marcar_mensagens_como_lidas(self, conversa_id: int, usuario_id: int) -> None:
        await self.conn.execute(
            """UPDATE mensagens 
               SET lida = TRUE 
               WHERE conversa_id = $1 AND remetente_id != $2 AND lida = FALSE""",
            conversa_id, usuario_id
        )

    async def get_nao_lidas_count(self, user_id: int) -> Optional[int]:
        return await self.conn.fetchval(
            """SELECT COUNT(*) 
               FROM mensagens m
               JOIN conversas c ON m.conversa_id = c.id
               WHERE m.remetente_id != $1 
                 AND m.lida = FALSE
                 AND (c.usuario1_id = $1 OR c.usuario2_id = $1)""",
            user_id
        )