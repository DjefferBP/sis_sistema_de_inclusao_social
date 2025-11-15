from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class ConversaBase(BaseModel):

    usuario2_id: int  

class ConversaResponse(ConversaBase):

    id: int
    usuario1_id: int  
    data_criacao: datetime
    ultima_mensagem: Optional[datetime] = None
    created_at: datetime
    outro_usuario_nome: Optional[str] = None
    outro_usuario_avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

class MensagemBase(BaseModel):
    mensagem: str

class MensagemCreate(MensagemBase):
    conversa_id: int

    @validator('mensagem')
    def validar_mensagem(cls, v):
        if len(v) < 1:
            raise ValueError('A mensagem não pode estar vazia')
        if len(v) > 5000:
            raise ValueError('A mensagem deve ter no máximo 5000 caracteres')
        return v.strip()

class MensagemResponse(MensagemBase):
    id: int
    conversa_id: int
    remetente_id: int
    data_envio: datetime
    lida: bool = False
    created_at: datetime
    remetente_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class ConversaWithMessagesResponse(ConversaResponse):
    mensagens: List[MensagemResponse] = []