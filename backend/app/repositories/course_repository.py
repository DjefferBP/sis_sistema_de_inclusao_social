import asyncpg
from typing import Optional, List, Dict, Any
from app.models.course import CourseCreate

class CourseRepository:

    
    def __init__(self, connection: asyncpg.Connection):
        self.conn = connection

    async def create(self, course_data: CourseCreate) -> Optional[Dict[str, Any]]:

        return await self.conn.fetchrow(
            """INSERT INTO cursos (titulo, descricao, url_curso, imagem_url, modalidade, area, carga_horaria, gratuito)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               RETURNING id, titulo, descricao, url_curso, imagem_url, modalidade, area, carga_horaria, gratuito, created_at, updated_at""",
            course_data.titulo, course_data.descricao, course_data.url_curso,
            course_data.imagem_url, course_data.modalidade, course_data.area,
            course_data.carga_horaria, course_data.gratuito
        )

    async def get_by_id(self, course_id: int) -> Optional[Dict[str, Any]]:

        return await self.conn.fetchrow(
            "SELECT * FROM cursos WHERE id = $1",
            course_id
        )

    async def get_all(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            "SELECT * FROM cursos ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            limit, offset
        )

    async def get_by_area(self, area: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.conn.fetch(
            "SELECT * FROM cursos WHERE area = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
            area, limit, offset
        )



    async def search(self, query: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        search_term = f"%{query}%"
        return await self.conn.fetch(
            """SELECT * FROM cursos 
               WHERE titulo ILIKE $1 OR descricao ILIKE $1
               ORDER BY created_at DESC 
               LIMIT $2 OFFSET $3""",
            search_term, limit, offset
        )

    async def count_all(self) -> Optional[int]:
        return await self.conn.fetchval("SELECT COUNT(*) FROM cursos")

    async def get_areas(self) -> List[str]:
        result = await self.conn.fetch(
            "SELECT DISTINCT area FROM cursos WHERE area IS NOT NULL ORDER BY area"
        )
        return [row['area'] for row in result]

