from pydantic import BaseModel, Field
from typing import Optional

class TrabalhosBase(BaseModel):
    field: Optional[str] = Field(None, description="Cargo desejado (ex: 'Desenvolvedor de software')")
    location: Optional[str] = Field(None, description="Localização (ex: 'Maringá')")
    page: Optional[int] = Field(1, ge=1, description="Página (mínimo: 1)")
    sort_by: Optional[str] = Field(None, description="Ordenar por: 'dia', 'semana', 'mês'")
    job_type: Optional[str] = Field(None, description="Tipo de vaga: 'tempo integral', 'meio período', etc.")
    experience_level: Optional[str] = Field(None, description="Nível: 'estágio', 'júnior', 'pleno', 'sênior', 'diretor'")
    work_type: Optional[str] = Field(None, description="Tipo: 'presencial', 'remoto', 'híbrido'")