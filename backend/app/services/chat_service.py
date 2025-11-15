# app/services/chat_service.py
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.repositories.chat_repository import ChatRepository
from app.repositories.user_repository import UserRepository
from app.services.xp_service import XPService
from app.models.chat import MensagemCreate

class ChatService:
    def __init__(self, chat_repository: ChatRepository, user_repository: UserRepository, xp_service: XPService):
        self.chat_repo = chat_repository
        self.user_repo = user_repository
        self.xp_service = xp_service

    async def iniciar_ou_buscar_conversa(self, usuario1_id: int, usuario2_id: int) -> Dict[str, Any]:

        usuario2 = await self.user_repo.get_by_id(usuario2_id)
        if not usuario2:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        if usuario1_id == usuario2_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível iniciar conversa consigo mesmo"
            )

        conversa = await self.chat_repo.get_or_create_conversa(usuario1_id, usuario2_id)
        if not conversa:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar/conversa"
            )

        if conversa['data_criacao'] == conversa['created_at']: 
            await self.xp_service.adicionar_xp_usuario(
                usuario1_id, 
                "iniciar_conversa", 
                f"Iniciou conversa com {usuario2['nome']}"
            )

        return {
            "conversa": dict(conversa),
            "outro_usuario": {
                "id": usuario2_id,
                "nome": usuario2['nome'],
                "nivel": usuario2['nivel_atual']
            }
        }

    async def listar_conversas_usuario(self, user_id: int) -> List[Dict[str, Any]]:
        conversas = await self.chat_repo.get_conversas_usuario(user_id)
        return [dict(conversa) for conversa in conversas]

    async def enviar_mensagem(self, conversa_id: int, remetente_id: int, mensagem_data: MensagemCreate) -> Dict[str, Any]:

        conversas = await self.chat_repo.get_conversas_usuario(remetente_id)
        conversa_encontrada = any(conv['id'] == conversa_id for conv in conversas)
        
        if not conversa_encontrada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada ou acesso negado"
            )

        mensagem = await self.chat_repo.criar_mensagem(conversa_id, remetente_id, mensagem_data)
        if not mensagem:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar mensagem"
            )
        await self.xp_service.adicionar_xp_usuario(
            remetente_id, 
            "enviar_mensagem", 
            "Enviou uma mensagem no chat"
        )

        return {
            "mensagem": dict(mensagem),
            "conversa_id": conversa_id,
            "mensagem": "Mensagem enviada com sucesso!"
        }

    async def obter_mensagens_conversa(self, conversa_id: int, user_id: int, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        conversas = await self.chat_repo.get_conversas_usuario(user_id)
        conversa_encontrada = any(conv['id'] == conversa_id for conv in conversas)
        
        if not conversa_encontrada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada ou acesso negado"
            )

        mensagens = await self.chat_repo.get_mensagens_conversa(conversa_id, limit, offset)
        await self.chat_repo.marcar_mensagens_como_lidas(conversa_id, user_id)

        return {
            "conversa_id": conversa_id,
            "mensagens": [dict(msg) for msg in mensagens],
            "total": len(mensagens),
            "limit": limit,
            "offset": offset
        }

    async def obter_conversa_completa(self, conversa_id: int, user_id: int) -> Dict[str, Any]:
        conversas = await self.chat_repo.get_conversas_usuario(user_id)
        conversa = next((conv for conv in conversas if conv['id'] == conversa_id), None)
        
        if not conversa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada"
            )

        mensagens = await self.chat_repo.get_mensagens_conversa(conversa_id, limit=100)
        await self.chat_repo.marcar_mensagens_como_lidas(conversa_id, user_id)

        return {
            "conversa": dict(conversa),
            "mensagens": [dict(msg) for msg in mensagens],
            "total_mensagens": len(mensagens)
        }

    async def get_nao_lidas_count(self, user_id: int) -> Dict[str, Any]:
        count = await self.chat_repo.get_nao_lidas_count(user_id)
        
        return {
            "usuario_id": user_id,
            "mensagens_nao_lidas": count or 0
        }

    async def buscar_conversa_por_usuarios(self, usuario1_id: int, usuario2_id: int) -> Optional[Dict[str, Any]]:
        conversa = await self.chat_repo.get_or_create_conversa(usuario1_id, usuario2_id)
        return dict(conversa) if conversa else None