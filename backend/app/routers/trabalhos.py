from fastapi import APIRouter, Depends
from app.services.trabalhos_service import JobService
from app.models.trabalhos import TrabalhosBase

router = APIRouter(prefix="/trabalhos", tags=["Trabalhos"])

@router.post("/vagas", response_model=dict)
async def buscar_vagas(
    filtros: TrabalhosBase,
    job_service: JobService = Depends(lambda: JobService())
):
    return await job_service.consultar_vagas_trabalhos(filtros)