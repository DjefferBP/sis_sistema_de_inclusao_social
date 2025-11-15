import asyncpg
from typing import Optional, List, Dict, Any
from app.models.user import UserCreate, UserResposta
from app.core.security import hash_senha    

class UserRepository:
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection
    
    async def get_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        usuario: Optional[asyncpg.Record] = await self.conn.fetchrow(
            """SELECT id, nome, email, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios WHERE id = $1""",
            user_id
        )
        
        if not usuario:
            return None
            
        usuario_dict: Dict[str, Any] = dict(usuario)

        grupos = await self.conn.fetch(
            """SELECT gv.id, gv.categoria, gv.tipo
               FROM usuario_grupos_vulnerabilidade ugv
               JOIN grupos_vulnerabilidade gv ON ugv.grupo_vulnerabilidade_id = gv.id
               WHERE ugv.usuario_id = $1""",
            user_id
        )
        
        usuario_dict['grupos_vulnerabilidade'] = [dict(grupo) for grupo in grupos]
        return usuario_dict
    
    async def get_by_email(self, user_email: str) -> Optional[Dict[str, Any]]:
        usuario: Optional[asyncpg.Record] = await self.conn.fetchrow(
            """SELECT id, nome, email, senha_hash, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios WHERE email = $1""",
            user_email
        )
        
        if not usuario:
            return None
            
        usuario_dict: Dict[str, Any] = dict(usuario)

        grupos = await self.conn.fetch(
            """SELECT gv.id, gv.categoria, gv.tipo
               FROM usuario_grupos_vulnerabilidade ugv
               JOIN grupos_vulnerabilidade gv ON ugv.grupo_vulnerabilidade_id = gv.id
               WHERE ugv.usuario_id = $1""",
            usuario_dict['id']
        )
        
        usuario_dict['grupos_vulnerabilidade'] = [dict(grupo) for grupo in grupos]
        return usuario_dict
    
    async def create(self, user_data: UserCreate) -> Optional[Dict[str, Any]]:
        senha_hash = hash_senha(user_data.senha)
        
        async with self.conn.transaction():
            usuario: Optional[asyncpg.Record] = await self.conn.fetchrow(
                """INSERT INTO usuarios (nome, email, senha_hash, cep, estado, cidade, bio)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, nome, email, cep, estado, cidade, bio, 
                          xp_atual, nivel_atual, created_at""",
                user_data.nome, user_data.email, senha_hash,
                user_data.cep, user_data.estado, user_data.cidade,
                user_data.bio
            )
            
            if not usuario:
                return None
                
            usuario_dict: Dict[str, Any] = dict(usuario)
            if user_data.grupos_vulnerabilidade:
                for grupo_id in user_data.grupos_vulnerabilidade:
                    await self.conn.execute(
                        """INSERT INTO usuario_grupos_vulnerabilidade 
                           (usuario_id, grupo_vulnerabilidade_id)
                           VALUES ($1, $2)""",
                        usuario_dict['id'], grupo_id
                    )
            grupos = await self.conn.fetch(
                """SELECT gv.id, gv.categoria, gv.tipo
                   FROM usuario_grupos_vulnerabilidade ugv
                   JOIN grupos_vulnerabilidade gv ON ugv.grupo_vulnerabilidade_id = gv.id
                   WHERE ugv.usuario_id = $1""",
                usuario_dict['id']
            )
            
            usuario_dict['grupos_vulnerabilidade'] = [dict(grupo) for grupo in grupos]
            return usuario_dict

    async def update_grupos_vulnerabilidade(self, user_id: int, grupos_ids: List[int]) -> None:
        async with self.conn.transaction():
            await self.conn.execute(
                "DELETE FROM usuario_grupos_vulnerabilidade WHERE usuario_id = $1",
                user_id
            )

            for grupo_id in grupos_ids:
                await self.conn.execute(
                    """INSERT INTO usuario_grupos_vulnerabilidade 
                       (usuario_id, grupo_vulnerabilidade_id)
                       VALUES ($1, $2)""",
                    user_id, grupo_id
                )

    async def update(self, user_id: int, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self.conn.transaction():
            campos: List[str] = []
            valores: List[Any] = []
            contador = 1
            
            for campo, valor in user_data.items():
                if valor is not None and campo != 'grupos_vulnerabilidade':
                    campos.append(f"{campo} = ${contador}")
                    valores.append(valor)
                    contador += 1
            
            usuario: Optional[asyncpg.Record]
            
            if campos:
                valores.append(user_id)
                query = f"""
                    UPDATE usuarios 
                    SET {', '.join(campos)}, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ${contador}
                    RETURNING id, nome, email, cep, estado, cidade, bio, 
                              xp_atual, nivel_atual, created_at
                """
                
                usuario = await self.conn.fetchrow(query, *valores)
                if not usuario:
                    return None
            else:
                usuario = await self.conn.fetchrow(
                    "SELECT id, nome, email, cep, estado, cidade, bio, xp_atual, nivel_atual, created_at FROM usuarios WHERE id = $1",
                    user_id
                )
            
            if not usuario:
                return None
                
            usuario_dict: Dict[str, Any] = dict(usuario)

            grupos = await self.conn.fetch(
                """SELECT gv.id, gv.categoria, gv.tipo
                   FROM usuario_grupos_vulnerabilidade ugv
                   JOIN grupos_vulnerabilidade gv ON ugv.grupo_vulnerabilidade_id = gv.id
                   WHERE ugv.usuario_id = $1""",
                user_id
            )
            
            usuario_dict['grupos_vulnerabilidade'] = [dict(grupo) for grupo in grupos]
            return usuario_dict

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        usuarios_records = await self.conn.fetch(
            """SELECT id, nome, email, cep, estado, cidade, foto_perfil,
                      xp_atual, nivel_atual, titulo_equipado_id, bio, created_at
               FROM usuarios 
               ORDER BY created_at DESC 
               LIMIT $1 OFFSET $2""",
            limit, offset
        )
        
        usuarios_com_grupos: List[Dict[str, Any]] = []
        for usuario in usuarios_records:
            usuario_dict: Dict[str, Any] = dict(usuario)

            grupos = await self.conn.fetch(
                """SELECT gv.id, gv.categoria, gv.tipo
                   FROM usuario_grupos_vulnerabilidade ugv
                   JOIN grupos_vulnerabilidade gv ON ugv.grupo_vulnerabilidade_id = gv.id
                   WHERE ugv.usuario_id = $1""",
                usuario_dict['id']
            )
            
            usuario_dict['grupos_vulnerabilidade'] = [dict(grupo) for grupo in grupos]
            usuarios_com_grupos.append(usuario_dict)
        
        return usuarios_com_grupos

    async def update_xp(self, user_id: int, xp_ganho: int) -> Optional[Dict[str, Any]]:
        result: Optional[asyncpg.Record] = await self.conn.fetchrow(
            """UPDATE usuarios 
               SET xp_atual = xp_atual + $1, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $2 
               RETURNING xp_atual, nivel_atual""",
            xp_ganho, user_id
        )
        return dict(result) if result else None
        
    async def update_nivel(self, user_id: int, novo_nivel: int) -> None:
        await self.conn.execute(
            "UPDATE usuarios SET nivel_atual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            novo_nivel, user_id
        )
    
    async def delete(self, user_id: int) -> bool:
        async with self.conn.transaction():

            await self.conn.execute(
                "DELETE FROM usuario_grupos_vulnerabilidade WHERE usuario_id = $1",
                user_id
            )

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