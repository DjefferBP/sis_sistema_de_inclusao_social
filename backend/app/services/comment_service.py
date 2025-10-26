from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.repositories.comment_repository import CommentRepository
from app.repositories.post_repository import PostRepository
from app.services.xp_service import XPService
from app.models.comment import CommentCreate

class CommentService:
    def __init__(self, comment_repository: CommentRepository, post_repository: PostRepository, xp_service: XPService):
        self.comment_repo = comment_repository
        self.post_repo = post_repository
        self.xp_service = xp_service

    async def criar_comentario(self, user_id: int, comment_data: CommentCreate) -> Dict[str, Any]:

        post = await self.post_repo.get_by_id(comment_data.post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )

        novo_comentario = await self.comment_repo.create(user_id, comment_data)
        if not novo_comentario:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar comentário"
            )

        await self.post_repo.incrementar_comentarios(comment_data.post_id)


        xp_resultado = await self.xp_service.adicionar_xp_usuario(
            user_id, 
            "comentar_post", 
            f"Comentou no post: {post['titulo'][:30]}..."
        )


        if post['usuario_id'] != user_id:
            await self.xp_service.adicionar_xp_usuario(
                post['usuario_id'], 
                "post_comentado", 
                f"Post '{post['titulo'][:30]}...' recebeu um comentário"
            )

        return {
            "comentario": dict(novo_comentario),
            "xp_ganho": xp_resultado["xp_ganho"],
            "mensagem": f"Comentário criado com sucesso! +{xp_resultado['xp_ganho']} XP"
        }

    async def obter_comentario_por_id(self, comment_id: int) -> Dict[str, Any]:

        comentario = await self.comment_repo.get_by_id(comment_id)
        if not comentario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )
        return dict(comentario)

    async def listar_comentarios_por_post(self, post_id: int, limit: int = 50, offset: int = 0) -> Dict[str, Any]:

        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )

        comentarios = await self.comment_repo.get_by_post_id(post_id, limit, offset)
        
        return {
            "comentarios": [dict(comentario) for comentario in comentarios],
            "post_id": post_id,
            "post_titulo": post['titulo'],
            "total": len(comentarios)
        }

    async def listar_comentarios_usuario(self, user_id: int, limit: int = 20, offset: int = 0) -> Dict[str, Any]:

        comentarios = await self.comment_repo.get_by_user_id(user_id, limit, offset)
        
        return {
            "comentarios": [dict(comentario) for comentario in comentarios],
            "usuario_id": user_id,
            "total": len(comentarios)
        }

    async def curtir_comentario(self, comment_id: int, user_id: int) -> Dict[str, Any]:

        comentario = await self.comment_repo.get_by_id(comment_id)
        if not comentario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )

        resultado_curtidas = await self.comment_repo.incrementar_curtidas(comment_id)
        if not resultado_curtidas:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao curtir comentário"
            )

        if comentario['usuario_id'] != user_id:
            await self.xp_service.adicionar_xp_usuario(
                comentario['usuario_id'], 
                "comentario_curtido", 
                "Comentário recebeu uma curtida"
            )

        return {
            "comentario_id": comment_id,
            "curtidas_count": resultado_curtidas['curtidas_count'],
            "mensagem": "Comentário curtido com sucesso!"
        }

    async def descurtir_comentario(self, comment_id: int, user_id: int) -> Dict[str, Any]:

        comentario = await self.comment_repo.get_by_id(comment_id)
        if not comentario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )

        resultado_curtidas = await self.comment_repo.decrementar_curtidas(comment_id)
        if not resultado_curtidas:
            raise HTTPException(401, "Nao foi possível descurtir o comentário!")
        
        return {
            "comentario_id": comment_id,
            "curtidas_count": resultado_curtidas['curtidas_count'],
            "mensagem": "Curtida removida do comentário!"
        }

    async def deletar_comentario(self, comment_id: int, user_id: int) -> Dict[str, Any]:

        comentario = await self.comment_repo.get_by_id(comment_id)
        if not comentario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comentário não encontrado"
            )

        if comentario['usuario_id'] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para deletar este comentário"
            )

        post_id = comentario['post_id']

        sucesso = await self.comment_repo.delete(comment_id, user_id)
        if not sucesso:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao deletar comentário"
            )

        await self.post_repo.decrementar_comentarios(post_id)

        return {
            "mensagem": "Comentário deletado com sucesso!",
            "comentario_id": comment_id
        }