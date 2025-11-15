# app/services/user_service.py
from typing import Dict, Any, List
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.repositories.xp_repository import XPRepository
from app.models.user import UserCreate, UserLogin, UserUpdate
from app.services.cep_service import cep_service

class UserService:
    def __init__(self, user_repository: UserRepository, xp_repository: XPRepository):
        self.user_repo = user_repository
        self.xp_repo = xp_repository

    async def registrar_usuario(self, user_data: UserCreate) -> Dict[str, Any]:
        try:
            usuario_existente = await self.user_repo.get_by_email(user_data.email)
            if usuario_existente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email já cadastrado!"
                )

            estado = user_data.estado
            cidade = user_data.cidade
            
            if user_data.cep:
                try:
                    print(f"📍 Tentando consultar CEP: {user_data.cep}")
                    dados_cep = await cep_service.consultar_cep(user_data.cep)
                    estado = dados_cep["estado"]
                    cidade = dados_cep["cidade"]
                    print(f"📍 CEP consultado com sucesso: {user_data.cep} -> {cidade}/{estado}")
                    
                except HTTPException as he:
                    print(f"🚨 HTTPException do CEP capturada no UserService: {he.detail}")
                    # PROPAGA A EXCEÇÃO
                    raise he
                except Exception as e:
                    print(f"⚠️ Outro erro no CEP: {e}")
                    # Continua sem atualizar estado/cidade
                    pass

            user_data_dict = user_data.dict()
            user_data_dict["estado"] = estado
            user_data_dict["cidade"] = cidade

            if user_data_dict.get("foto_perfil") == "string":
                user_data_dict["foto_perfil"] = None

            user_data_updated = UserCreate(**user_data_dict)

            novo_usuario = await self.user_repo.create(user_data_updated)

            if not novo_usuario:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao criar usuário!"
                )

            await self._adicionar_xp_por_acao(novo_usuario['id'], 'cadastro')
            
            return dict(novo_usuario)
        
        except HTTPException:
            # Re-lança HTTPExceptions para que cheguem no frontend
            raise
        except Exception as e:
            print(f"❌ ERRO no registro: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro interno: {str(e)}"
            )

    async def autenticar_usuario(self, login_data: UserLogin) -> Dict[str, Any]:
        from app.core.security import verificar_senha, criar_token_acesso
        
        usuario = await self.user_repo.get_by_email(login_data.email)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos!"
            )
            
        if 'senha_hash' not in usuario:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno do sistema!"
            )
        
        if not verificar_senha(login_data.senha, usuario['senha_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos!"
            )
        
        token = criar_token_acesso(
            data={"sub": usuario['email'], "user_id": usuario['id']}
        )
        
        usuario_sem_senha = {k: v for k, v in usuario.items() if k != 'senha_hash'}
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": usuario_sem_senha
        }

    async def obter_perfil_usuario(self, user_id: int) -> Dict[str, Any]:
        usuario = await self.user_repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado!"
            )
        
        return dict(usuario)

    async def listar_usuarios(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        usuarios = await self.user_repo.get_all(limit, offset)
        return [dict(usuario) for usuario in usuarios]

    async def _adicionar_xp_por_acao(self, user_id: int, acao: str) -> Dict[str, Any]:
        acao_xp = await self.xp_repo.get_acao_xp(acao)
        if not acao_xp:
            return {"xp_ganho": 0, "acao": acao, "mensagem": "Ação não configurada"}
        
        xp_ganho = acao_xp['xp_ganho']
        resultado_xp = await self.user_repo.update_xp(user_id, xp_ganho)
        
        if not resultado_xp:
            usuario = await self.user_repo.get_by_id(user_id)
            if not usuario:
                return {"xp_ganho": 0, "acao": acao, "mensagem": "Usuário não encontrado"}
            xp_total = usuario['xp_atual'] + xp_ganho
            nivel_atual = usuario['nivel_atual']
        else:
            xp_total = resultado_xp['xp_atual']
            nivel_atual = resultado_xp['nivel_atual']

        await self.xp_repo.registrar_historico_xp(
            user_id, acao, xp_ganho, acao_xp['descricao']
        )
        
        return {
            "xp_ganho": xp_ganho,
            "acao": acao,
            "xp_total": xp_total,
            "nivel_atual": nivel_atual,
            "mensagem": f"+{xp_ganho} XP por {acao_xp['descricao']}"
        }

    async def adicionar_xp_usuario(self, user_id: int, acao: str) -> Dict[str, Any]:
        return await self._adicionar_xp_por_acao(user_id, acao)
    
    async def atualizar_perfil_usuario(self, user_id: int, user_update: UserUpdate) -> Dict[str, Any]:
        usuario = await self.user_repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado!"
            )

        update_data = user_update.dict(exclude_unset=True)
        
        grupos_vulnerabilidade = update_data.pop('grupos_vulnerabilidade', None)

        cep_atual = usuario.get('cep')
        novo_cep = update_data.get('cep')

        if (novo_cep and 
            novo_cep != "string" and 
            novo_cep != cep_atual and 
            novo_cep.strip() != ''):
            
            try:
                dados_cep = await cep_service.consultar_cep(novo_cep)
                update_data['estado'] = dados_cep["estado"]
                update_data['cidade'] = dados_cep["cidade"]
                print(f"📍 CEP atualizado: {novo_cep} -> {dados_cep['cidade']}/{dados_cep['estado']}")
            except Exception as e:
                print(f"⚠️ Erro ao consultar CEP para atualização: {str(e)}")
                if 'estado' in update_data:
                    del update_data['estado']
                if 'cidade' in update_data:
                    del update_data['cidade']
        
        elif novo_cep == "string":
            del update_data['cep']

            if 'estado' in update_data:
                del update_data['estado']
            if 'cidade' in update_data:
                del update_data['cidade']
        
        elif novo_cep == cep_atual:
            if 'estado' in update_data:
                del update_data['estado']
            if 'cidade' in update_data:
                del update_data['cidade']

        if update_data:
            usuario_atualizado = await self.user_repo.update(user_id, update_data)
        else:
            usuario_atualizado = usuario

        if grupos_vulnerabilidade is not None:
            await self.user_repo.update_grupos_vulnerabilidade(user_id, grupos_vulnerabilidade)
            usuario_atualizado = await self.user_repo.get_by_id(user_id)

        if not usuario_atualizado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar perfil!"
            )

        return usuario_atualizado