from typing import Dict, Any
from fastapi import HTTPException, status
from app.repositories.course_repository import CourseRepository
from app.services.xp_service import XPService
from app.models.course import CourseCreate

class CourseService:
    def __init__(self, course_repository: CourseRepository, xp_service: XPService):
        self.course_repo = course_repository
        self.xp_service = xp_service

    async def criar_curso(self, course_data: CourseCreate) -> Dict[str, Any]:
        try:
            novo_curso = await self.course_repo.create(course_data)
            if not novo_curso:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao criar curso"
                )

            return {
                "curso": dict(novo_curso),
                "mensagem": "Curso criado com sucesso!"
            }

        except Exception as e:
            if "duplicate key" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe um curso com este título ou URL"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao criar curso: {str(e)}"
            )

    async def obter_curso_por_id(self, course_id: int) -> Dict[str, Any]:
        
        curso = await self.course_repo.get_by_id(course_id)
        if not curso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso não encontrado"
            )
        return dict(curso)

    async def listar_cursos(self, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        cursos = await self.course_repo.get_all(limit, offset)
        total = await self.course_repo.count_all()

        if not total:
            raise HTTPException(400, "Não foi possível encontrar o total de cursos!")

        return {
            "cursos": [dict(curso) for curso in cursos],
            "total": total,
            "pagina": (offset // limit) + 1,
            "por_pagina": limit,
            "total_paginas": (total + limit - 1) // limit
        }

    async def listar_cursos_por_area(self, area: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:

        cursos = await self.course_repo.get_by_area(area, limit, offset)
        
        return {
            "cursos": [dict(curso) for curso in cursos],
            "area": area,
            "total": len(cursos)
        }

    async def buscar_cursos(self, query: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:

        if len(query) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Termo de busca deve ter pelo menos 2 caracteres"
            )

        cursos = await self.course_repo.search(query, limit, offset)
        
        return {
            "cursos": [dict(curso) for curso in cursos],
            "query": query,
            "total": len(cursos),
            "limit": limit,
            "offset": offset
        }


    async def obter_areas_disponiveis(self) -> Dict[str, Any]:
        areas = await self.course_repo.get_areas()
        
        return {
            "areas": areas,
            "total_areas": len(areas)
        }

    async def get_estatisticas_cursos(self) -> Dict[str, Any]:
        total_cursos = await self.course_repo.count_all()
        areas = await self.course_repo.get_areas()
        
        cursos_por_area = {}
        for area in areas:
            cursos_area = await self.course_repo.get_by_area(area, limit=1000)
            cursos_por_area[area] = len(cursos_area)

        return {
            "total_cursos": total_cursos,
            "total_areas": len(areas),
            "cursos_por_area": cursos_por_area,
            "areas_disponiveis": areas
        }