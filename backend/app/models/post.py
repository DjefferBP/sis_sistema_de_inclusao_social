from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class PostBase(BaseModel):
    titulo: str
    conteudo: str
    categoria: Optional[str] = None

class PostCreate(PostBase):
    @validator('titulo')
    def validar_titulo(cls, v):
        if len(v) < 5:
            raise ValueError('O título deve ter pelo menos 5 caracteres')
        if len(v) > 200:
            raise ValueError('O título deve ter no máximo 200 caracteres')
        return v.strip()

    @validator('conteudo')
    def validar_conteudo(cls, v):
        if len(v) < 10:
            raise ValueError('O conteúdo deve ter pelo menos 10 caracteres')
        return v.strip()

class PostResponse(PostBase):
    id: int
    usuario_id: int
    curtidas_count: int = 0
    comentarios_count: int = 0
    created_at: datetime
    updated_at: datetime
    autor_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int