# app/services/xp_service.py
from typing import Optional, Dict, Any, List, Tuple
from fastapi import HTTPException, status
from app.repositories.xp_repository import XPRepository
from app.repositories.user_repository import UserRepository

class XPService:
    def __init__(self, xp_repository: XPRepository, user_repository: UserRepository):
        self.xp_repo = xp_repository
        self.user_repo = user_repository

    async def adicionar_xp_usuario(self, user_id: int, acao: str, descricao_personalizada: Optional[str] = None) -> Dict[str, Any]:
        acao_xp = await self.xp_repo.get_acao_xp(acao)
        if not acao_xp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ação '{acao}' não encontrada no sistema de XP"
            )

        xp_ganho = acao_xp['xp_ganho']
        descricao = descricao_personalizada or acao_xp['descricao']

        usuario = await self.user_repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        resultado_xp = await self.user_repo.update_xp(user_id, xp_ganho)
        if not resultado_xp:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar XP do usuário"
            )

        xp_total = resultado_xp['xp_atual']
        nivel_anterior = usuario['nivel_atual']

        novo_nivel_data = await self.xp_repo.get_nivel_por_xp(xp_total)
        if novo_nivel_data and novo_nivel_data['nivel'] != nivel_anterior:
            await self.user_repo.update_nivel(user_id, novo_nivel_data['nivel'])
            nivel_atual = novo_nivel_data['nivel']
            nivel_up = True
        else:
            nivel_atual = nivel_anterior
            nivel_up = False

        await self.xp_repo.registrar_historico_xp(
            user_id, acao, xp_ganho, descricao
        )

        return {
            "xp_ganho": xp_ganho,
            "xp_total": xp_total,
            "nivel_anterior": nivel_anterior,
            "nivel_atual": nivel_atual,
            "nivel_up": nivel_up,
            "acao": acao,
            "descricao": descricao,
            "titulo_atual": novo_nivel_data['titulo'] if novo_nivel_data else None
        }

    async def get_progresso_usuario(self, user_id: int) -> Dict[str, Any]:
        usuario = await self.user_repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        xp_atual = usuario['xp_atual']
        nivel_atual = usuario['nivel_atual']

        nivel_data = await self.xp_repo.get_nivel_por_xp(xp_atual)

        proximo_nivel = await self.xp_repo.get_proximo_nivel(nivel_atual)

        if proximo_nivel:
            xp_proximo_nivel = proximo_nivel['xp_necessario']
            xp_nivel_atual = nivel_data['xp_necessario'] if nivel_data else 0
            progresso = ((xp_atual - xp_nivel_atual) / (xp_proximo_nivel - xp_nivel_atual)) * 100
        else:
            progresso = 100 

        return {
            "usuario_id": user_id,
            "xp_atual": xp_atual,
            "nivel_atual": nivel_atual,
            "titulo_atual": nivel_data['titulo'] if nivel_data else "Iniciante",
            "progresso_proximo_nivel": round(progresso, 2),
            "proximo_nivel": {
                "nivel": proximo_nivel['nivel'] if proximo_nivel else None,
                "titulo": proximo_nivel['titulo'] if proximo_nivel else None,
                "xp_necessario": proximo_nivel['xp_necessario'] if proximo_nivel else None,
                "xp_restante": (proximo_nivel['xp_necessario'] - xp_atual) if proximo_nivel else 0
            } if proximo_nivel else None
        }

    async def get_historico_xp_usuario(self, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:

        historico = await self.xp_repo.get_historico_xp_usuario(user_id, limit)
        return [dict(item) for item in historico]

    async def get_todos_niveis_titulos(self) -> List[Dict[str, Any]]:

        niveis = await self.xp_repo.get_todos_niveis()
        return [dict(nivel) for nivel in niveis]

    async def equipar_titulo(self, user_id: int, titulo_id: int) -> Dict[str, Any]:

        titulo = await self.xp_repo.get_titulo_by_id(titulo_id)
        if not titulo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Título não encontrado"
            )

        usuario = await self.user_repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        if usuario['nivel_atual'] < titulo['nivel']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Você precisa alcançar o nível {titulo['nivel']} para equipar este título"
            )

        await self.user_repo.update_titulo_equipado(user_id, titulo_id)

        return {
            "mensagem": f"Título '{titulo['titulo']}' equipado com sucesso!",
            "titulo_equipado": titulo['titulo'],
            "nivel_requerido": titulo['nivel'],
            "nivel_usuario": usuario['nivel_atual']
        }

    async def remover_titulo_equipado(self, user_id: int) -> Dict[str, Any]:
        await self.user_repo.update_titulo_equipado(user_id, None)
        
        return {
            "mensagem": "Título removido com sucesso!",
            "titulo_equipado": None
        }

    async def calcular_xp_para_proximo_nivel(self, user_id: int) -> Dict[str, Any]:

        progresso = await self.get_progresso_usuario(user_id)
        
        return {
            "xp_atual": progresso['xp_atual'],
            "nivel_atual": progresso['nivel_atual'],
            "xp_necessario_proximo_nivel": progresso['proximo_nivel']['xp_necessario'] if progresso['proximo_nivel'] else None,
            "xp_restante": progresso['proximo_nivel']['xp_restante'] if progresso['proximo_nivel'] else 0,
            "progresso_percentual": progresso['progresso_proximo_nivel']
        }