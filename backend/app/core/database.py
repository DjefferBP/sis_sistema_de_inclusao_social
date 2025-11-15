# app/core/database.py
import asyncpg
from typing import Optional
from app.core.config import settings

class Database:

    _pool: Optional[asyncpg.Pool] = None

    @classmethod
    async def get_pool(cls) -> asyncpg.Pool:

        if cls._pool is None:
            print("🔄 Criando pool de conexões com o banco...")

            cls._pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=5,
                max_size=20,
                command_timeout=60,  
                max_inactive_connection_lifetime=300,
            )
            print("✅ Pool de conexões criado!")
        
        return cls._pool

    @classmethod
    async def close_pool(cls):
        if cls._pool:
            await cls._pool.close()
            cls._pool = None
            print("🔒 Pool de conexões fechado")


async def get_connection():
    pool = await Database.get_pool()

    async with pool.acquire() as connection:
        yield connection


async def testar_conexao():

    try:
        pool = await Database.get_pool()
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            print("✅ Conexão com o banco estabelecida com sucesso!")
            return True
    except Exception as e:
        print(f"❌ Erro na conexão com o banco: {e}")
        return False