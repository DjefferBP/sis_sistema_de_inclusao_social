import asyncpg
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.repositories.post_repository import PostRepository
from app.repositories.comment_repository import CommentRepository
from app.services.xp_service import XPService
from app.models.post import PostCreate
class PostService:
    def __init__(self, post_repository: PostRepository, comment_repository: CommentRepository, xp_service: XPService, conn: asyncpg.Connection):
        self.post_repo = post_repository
        self.comment_repo = comment_repository
        self.xp_service = xp_service
        self.conn = conn

    async def criar_post(self, user_id: int, post_data: PostCreate) -> Dict[str, Any]:

        try:

            novo_post = await self.post_repo.create(user_id, post_data)
            if not novo_post:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao criar post"
                )


            xp_resultado = await self.xp_service.adicionar_xp_usuario(
                user_id, 
                "criar_post", 
                f"Criou o post: {post_data.titulo[:50]}..."
            )

            return {
                "post": dict(novo_post),
                "xp_ganho": xp_resultado["xp_ganho"],
                "mensagem": f"Post criado com sucesso! +{xp_resultado['xp_ganho']} XP"
            }

        except Exception as e:
            if "duplicate key" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Erro ao criar post - possível duplicidade"
                )
            raise e

    # No PostService, modifique estes métodos:

    # No PostService, modifique os métodos para ter parâmetros opcionais:

    # No PostService, modifique os métodos:

    async def obter_post_por_id(self, post_id: int, user_id: Optional[int] = None) -> Dict[str, Any]:
        post = await self.post_repo.get_by_id(post_id)
        print('O que retorna quando chamo essa função: ', post)
        if post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )
        
        # Adiciona informação se o usuário curtiu o post
        post['curtido'] = await self.post_repo.check_user_liked_post(post_id, user_id)
            
        return post

    async def listar_posts(self, limit: int = 20, offset: int = 0, user_id: Optional[int] = None) -> Dict[str, Any]:
        posts = await self.post_repo.get_all(limit, offset)
        total = await self.post_repo.count_all()

        if not total:
            raise HTTPException(400, "Total de posts não encontrado!")
        
        # Para cada post, verifica se o usuário curtiu
        posts_com_curtidas = []
        for post in posts:
            post_dict = dict(post)
            post_dict['curtido'] = await self.post_repo.check_user_liked_post(post_dict['id'], user_id)
            posts_com_curtidas.append(post_dict)
        
        return {
            "posts": posts_com_curtidas,
            "total": total,
            "pagina": (offset // limit) + 1,
            "por_pagina": limit,
            "total_paginas": (total + limit - 1) // limit
        }

    async def listar_posts_usuario(self, user_id: int, limit: int = 20, offset: int = 0, current_user_id: Optional[int] = None) -> Dict[str, Any]:
        posts = await self.post_repo.get_by_user_id(user_id, limit, offset)
        
        # Para cada post, verifica se o usuário atual curtiu
        posts_com_curtidas = []
        for post in posts:
            post_dict = dict(post)
            post_dict['curtido'] = await self.post_repo.check_user_liked_post(post_dict['id'], current_user_id)
            posts_com_curtidas.append(post_dict)
        
        return {
            "posts": posts_com_curtidas,
            "usuario_id": user_id,
            "total": len(posts)
        }

    async def listar_posts_por_categoria(self, categoria: str, limit: int = 20, offset: int = 0, user_id: Optional[int] = None) -> Dict[str, Any]:
        posts = await self.post_repo.get_by_categoria(categoria, limit, offset)
        
        # Para cada post, verifica se o usuário curtiu
        posts_com_curtidas = []
        for post in posts:
            post_dict = dict(post)
            post_dict['curtido'] = await self.post_repo.check_user_liked_post(post_dict['id'], user_id)
            posts_com_curtidas.append(post_dict)
        
        return {
            "posts": posts_com_curtidas,
            "categoria": categoria,
            "total": len(posts)
        }

    async def curtir_post(self, post_id: int, user_id: int) -> Dict[str, Any]:

        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )

        ja_curtiu = await self.conn.fetchval(
            "SELECT 1 FROM post_curtidas WHERE post_id = $1 AND usuario_id = $2",
            post_id, user_id
        )
        if ja_curtiu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você já curtiu este post"
            )

        await self.conn.execute(
            "INSERT INTO post_curtidas (post_id, usuario_id) VALUES ($1, $2)",
            post_id, user_id
        )
        
        resultado_curtidas = await self.post_repo.incrementar_curtidas(post_id)
        if not resultado_curtidas:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao curtir post"
            )

        if post['usuario_id'] != user_id:  
            await self.xp_service.adicionar_xp_usuario(
                post['usuario_id'], 
                "post_curtido", 
                f"Post '{post['titulo'][:30]}...' recebeu uma curtida"
            )

        return {
            "post_id": post_id,
            "curtidas_count": resultado_curtidas['curtidas_count'],
            "mensagem": "Post curtido com sucesso!"
        }

    async def descurtir_post(self, post_id: int, user_id: int) -> Dict[str, Any]:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )

        ja_curtiu = await self.conn.fetchval(
            "SELECT 1 FROM post_curtidas WHERE post_id = $1 AND usuario_id = $2",
            post_id, user_id
        )
        if not ja_curtiu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não curtiu este post"
            )

        await self.conn.execute(
            "DELETE FROM post_curtidas WHERE post_id = $1 AND usuario_id = $2",
            post_id, user_id
        )

        resultado_curtidas = await self.post_repo.decrementar_curtidas(post_id)
        if not resultado_curtidas:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao descurtir post"
            )

        return {
            "post_id": post_id,
            "curtidas_count": resultado_curtidas['curtidas_count'],
            "mensagem": "Curtida removida do post!"
        }

    async def deletar_post(self, post_id: int, user_id: int) -> Dict[str, Any]:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )

        if post['usuario_id'] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para deletar este post"
            )

        sucesso = await self.post_repo.delete(post_id, user_id)
        if not sucesso:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao deletar post"
            )

        return {
            "mensagem": "Post deletado com sucesso!",
            "post_id": post_id
        }

    async def get_estatisticas_post(self, post_id: int) -> Dict[str, Any]:

        post = await self.obter_post_por_id(post_id)
        comentarios_count = await self.comment_repo.count_by_post(post_id)

        return {
            **post,
            "comentarios_count": comentarios_count,
            "engajamento_total": (post['curtidas_count'] + comentarios_count) if comentarios_count != None else post["curtidas_count"]
        }