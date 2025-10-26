from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    nome: str
    email: EmailStr
    cep: Optional[str]
    estado: Optional[str]
    cidade: Optional[str]
    bio: Optional[str]
    
class UserCreate(UserBase):
    senha: str
    @validator('senha')
    def validar_senha(cls, v):
        if len(v) < 6:
            raise ValueError("A senha deve ter pelo menos 6 caracteres!")
        if len(v) > 100:
            raise ValueError("A senha deve ter no máximo 100 caracteres!")
        return v
    
    @validator('nome')
    def validar_nome(cls, v):
        if len(v) < 2:
            raise ValueError('O nome deve ter pelo menos 2 caracteres')
        if len(v) > 150:
            raise ValueError('O nome deve ter no máximo 150 caracteres')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserResposta(UserBase):
    id: int
    xp_atual: int
    nivel_atual: int
    titulo_equipado_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    nome: Optional[str]
    cep: Optional[str]
    estado: Optional[str]
    cidade: Optional[str]
    bio: Optional[str]
    
    @validator('nome')
    def validar_nome_update(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('O nome deve ter pelo menos 2 caracteres')
            if len(v) > 150:
                raise ValueError('O nome deve ter no máximo 150 caracteres')
            return v.strip()
        return v

class UserProfileResponse(UserResposta):
    grupos_vulnerabilidade: List[str] = []
    
    class Config:
        from_attributes = True
 
class UserFotoUpdate(BaseModel):
    foto_base64: Optional[str] = None 