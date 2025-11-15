# app/routers/courses.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
import asyncpg
from app.core.database import get_connection
from app.core.dependencies import get_usuario_atual
from app.services.course_service import CourseService
from app.repositories.course_repository import CourseRepository
from app.repositories.xp_repository import XPRepository
from app.repositories.user_repository import UserRepository
from app.services.xp_service import XPService
from app.models.course import CourseCreate, CourseUpdate

router = APIRouter(prefix="/cursos", tags=["cursos"])

async def get_course_service(conn: asyncpg.Connection = Depends(get_connection)) -> CourseService:
    course_repo = CourseRepository(conn)
    xp_repo = XPRepository(conn)
    user_repo = UserRepository(conn)
    xp_service = XPService(xp_repo, user_repo)
    return CourseService(course_repo, xp_service)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def criar_curso(
    course_data: CourseCreate,
    course_service: CourseService = Depends(get_course_service)
):
    return await course_service.criar_curso(course_data)

@router.get("/", response_model=dict)
async def listar_cursos(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    course_service: CourseService = Depends(get_course_service)
):

    return await course_service.listar_cursos(limit, offset)

@router.get("/{course_id}", response_model=dict)
async def obter_curso(
    course_id: int,
    course_service: CourseService = Depends(get_course_service)
):

    return await course_service.obter_curso_por_id(course_id)

@router.get("/area/{area}", response_model=dict)
async def listar_cursos_area(
    area: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    course_service: CourseService = Depends(get_course_service)
):

    return await course_service.listar_cursos_por_area(area, limit, offset)

@router.get("/buscar/{query}", response_model=dict)
async def buscar_cursos(
    query: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    course_service: CourseService = Depends(get_course_service)
):

    return await course_service.buscar_cursos(query, limit, offset)


@router.get("/areas/disponiveis", response_model=dict)
async def obter_areas_disponiveis(
    course_service: CourseService = Depends(get_course_service)
):

    return await course_service.obter_areas_disponiveis()

@router.get("/estatisticas/geral", response_model=dict)
async def estatisticas_cursos(
    course_service: CourseService = Depends(get_course_service)
):
    return await course_service.get_estatisticas_cursos()