import aiohttp
from typing import Dict, Any
from fastapi import HTTPException, status

class CEPService:
    def __init__(self):
        self.base_url = "https://viacep.com.br/ws"
    
    async def consultar_cep(self, cep: str) -> Dict[str, Any]:
        cep_limpo = cep.replace("-", "").replace(" ", "")
        
        if len(cep_limpo) != 8 or not cep_limpo.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CEP inválido. Deve conter 8 dígitos."
            )
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/{cep_limpo}/json/"
                print(f"🔍 Consultando CEP: {url}")
                
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        dados = await response.json()
                        print(f"📦 Resposta ViaCEP: {dados}")
                        print(f"🔎 'erro' in dados: {'erro' in dados}")
                        print(f"🔎 Valor de dados['erro']: {dados.get('erro')}")
                        print(f"🔎 Tipo: {type(dados.get('erro'))}")
                        

                        if "erro" in dados:
                            print("🎯 CHAVE 'erro' ENCONTRADA!")
                            if dados["erro"]:
                                print("🚨 Levantando HTTPException 404")
                                raise HTTPException(
                                    status_code=status.HTTP_404_NOT_FOUND,
                                    detail="CEP não encontrado"
                                )
                            else:
                                print("✅ 'erro' existe mas é False, continuando...")
                        else:
                            print("✅ Nenhuma chave 'erro' encontrada")
                        
                        return {
                            "cep": dados.get("cep", ""),
                            "logradouro": dados.get("logradouro", ""),
                            "bairro": dados.get("bairro", ""),
                            "cidade": dados.get("localidade", ""),
                            "estado": dados.get("uf", "")
                        }
                    else:
                        print(f"❌ Status code: {response.status}")
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Erro ao consultar o serviço de CEP"
                        )
                        
        except HTTPException as he:
            print(f"HTTPException no CEPService: {he.detail}")
            raise he

        except aiohttp.ClientError as e:
            print(f"ClientError: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Serviço de CEP indisponível: {str(e)}"
            )
        except Exception as e:
            print(f"Erro inesperado no CEPService: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro interno ao consultar CEP: {str(e)}"
            )

cep_service = CEPService()