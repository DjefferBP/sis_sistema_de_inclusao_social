from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NivelTituloBase(BaseModel):
    nivel: int
    xp_necessario: int
    titulo: str
    descricao: Optional[str] = None

class NivelTituloResponse(NivelTituloBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AcaoXPBase(BaseModel):
    acao: str
    xp_ganho: int
    descricao: Optional[str] = None

class AcaoXPResponse(AcaoXPBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class XPHistoricoBase(BaseModel):
    acao: str
    xp_ganho: int
    descricao: Optional[str] = None

class XPHistoricoResponse(XPHistoricoBase):
    id: int
    usuario_id: int
    data_acao: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class GrupoVulnerabilidadeBase(BaseModel):
    categoria: str
    tipo: str

class GrupoVulnerabilidadeResponse(GrupoVulnerabilidadeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProgressoResponse(BaseModel):
    usuario_id: int
    total_xp: int
    nivel_atual: int
    titulo_equipado: Optional[str] = None
    
    class Config:
        from_attributes = True