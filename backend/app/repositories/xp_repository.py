import asyncpg
from typing import Dict, Optional, List, Any

class XPRepository:
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection
        
    async def get_acao_xp(self, acao: str) -> Optional[Dict[str, Any]]:
        return await self.conn.fetchrow(
            "SELECT id, acao, xp_ganho, descricao FROM acoes_xp WHERE acao = $1",
            acao
        )
        
    async def get_nivel_por_xp(self, xp_total: int) -> Optional[Dict[str, Any]]:
        return await self.conn.fetchrow(
            """SELECT id, nivel, titulo, xp_necessario, descricao
               FROM niveis_titulos 
               WHERE xp_necessario <= $1 
               ORDER BY xp_necessario DESC 
               LIMIT 1""",
            xp_total
        )
    
    async def get_proximo_nivel(self, nivel_atual: int) -> Optional[Dict[str, Any]]:
        return await self.conn.fetchrow(
            """SELECT id, nivel, titulo, xp_necessario, descricao
               FROM niveis_titulos 
               WHERE nivel > $1 
               ORDER BY nivel ASC 
               LIMIT 1""",
            nivel_atual
        )
    
    async def registrar_historico_xp(self, user_id: int, acao: str, xp_ganho: int, descricao: Optional[str] = None) -> None:
        await self.conn.execute(
            """INSERT INTO usuario_xp_historico (usuario_id, acao, xp_ganho, descricao)
               VALUES ($1, $2, $3, $4)""",
            user_id, acao, xp_ganho, descricao
        )

    async def get_historico_xp_usuario(self, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            """SELECT id, acao, xp_ganho, descricao, data_acao, created_at
               FROM usuario_xp_historico 
               WHERE usuario_id = $1 
               ORDER BY data_acao DESC 
               LIMIT $2""",
            user_id, limit
        )
    
    async def get_todos_niveis(self) -> List[Dict[str, Any]]:

        return await self.conn.fetch(
            "SELECT id, nivel, titulo, xp_necessario, descricao FROM niveis_titulos ORDER BY nivel ASC"
        )

    async def get_titulo_by_id(self, titulo_id: int) -> Optional[Dict[str, Any]]:

        return await self.conn.fetchrow(
            "SELECT id, nivel, titulo, xp_necessario, descricao FROM niveis_titulos WHERE id = $1",
            titulo_id
        )