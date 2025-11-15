from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class CourseBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    url_curso: str
    imagem_url: Optional[str] = None
    modalidade: Optional[str] = None
    area: Optional[str] = None
    carga_horaria: Optional[int] = None
    gratuito: Optional[str] = None

class CourseCreate(CourseBase):
    @validator('titulo')
    def validar_titulo(cls, v):
        if len(v) < 5:
            raise ValueError('O título deve ter pelo menos 5 caracteres')
        if len(v) > 200:
            raise ValueError('O título deve ter no máximo 200 caracteres')
        return v.strip()

    @validator('url_curso')
    def validar_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('A URL deve começar com http:// ou https://')
        return v

class CourseUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    imagem_url: Optional[str] = None
    modalidade: Optional[str] = None
    area: Optional[str] = None
    carga_horaria: Optional[int] = None
    gratuito: Optional[str] = None

class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CourseListResponse(BaseModel):
    cursos: List[CourseResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int