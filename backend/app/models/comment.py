from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class CommentBase(BaseModel):
    conteudo: str

class CommentCreate(CommentBase):
    post_id: int

    @validator('conteudo')
    def validar_conteudo(cls, v):
        if len(v) < 2:
            raise ValueError('O comentário deve ter pelo menos 2 caracteres')
        if len(v) > 1000:
            raise ValueError('O comentário deve ter no máximo 1000 caracteres')
        return v.strip()

class CommentResponse(CommentBase):
    id: int
    post_id: int
    usuario_id: int
    curtidas_count: int = 0
    created_at: datetime
    updated_at: datetime
    autor_nome: Optional[str] = None
    
    class Config:
        from_attributes = True