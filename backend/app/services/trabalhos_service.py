import aiohttp
import json
from typing import Dict, Any
from fastapi import HTTPException, status
from app.models.trabalhos import TrabalhosBase
from app.core.config import settings

class JobService:
    def __init__(self):
        self.api_key = settings.API_KEY
        self.base_url = "https://api.scrapingdog.com/linkedinjobs"
        
    async def consultar_vagas_trabalhos(self, dados: TrabalhosBase) -> Dict[str, Any]:
        try:
            # Parâmetros exatos da documentação
            params = {
                "api_key": self.api_key,
                "page": dados.page or 1,
                "field": dados.field or '',
                "location": dados.location or '',
                "geoid": '',  
                "job_type": '',  
                "exp_level": '',    
                "work_type": '',  
                "sort_by": '',  
                "filter_by_company": ''  
            }
            
            # Debug completo
            print("🔍 === DEBUG SCRAPINGDOG API ===")
            print(f"📤 Enviando para: {self.base_url}")
            print(f"🔑 API Key: {self.api_key[:10]}...")
            print(f"📋 Parâmetros: {params}")
            
            # Construir URL manualmente para verificar
            from urllib.parse import urlencode
            query_string = urlencode(params)
            full_url = f"{self.base_url}?{query_string}"
            print(f"🌐 URL completa: {full_url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            }
            
            async with aiohttp.ClientSession() as session:
                print("🚀 Fazendo requisição...")
                
                async with session.get(
                    self.base_url, 
                    params=params, 
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    print(f"📥 Resposta recebida:")
                    print(f"   Status: {response.status}")
                    print(f"   Content-Type: {response.headers.get('content-type')}")
                    print(f"   Headers: {dict(response.headers)}")
                    
                    # Ler o conteúdo independente do tipo
                    raw_content = await response.text()
                    print(f"   Conteúdo (primeiros 200 chars): {raw_content[:200]}")
                    
                    if response.status == 200:
                        try:
                            # Tentar parsear como JSON
                            data = json.loads(raw_content)
                            print(f"✅ JSON parseado com sucesso!")
                            print(f"   Vagas encontradas: {len(data)}")
                            
                            return {
                                "sucesso": True,
                                "total_vagas": len(data),
                                "vagas": data,
                                "filtros_usados": params
                            }
                            
                        except json.JSONDecodeError as json_error:
                            print(f"❌ Erro ao decodificar JSON: {json_error}")
                            print(f"   Conteúdo real: {raw_content[:500]}")
                            
                            # Verificar se é mensagem de erro da API
                            if "credits" in raw_content.lower():
                                raise HTTPException(
                                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                                    detail="Créditos da API esgotados"
                                )
                            elif "invalid" in raw_content.lower():
                                raise HTTPException(
                                    status_code=status.HTTP_401_UNAUTHORIZED,
                                    detail="API Key inválida"
                                )
                            else:
                                raise HTTPException(
                                    status_code=status.HTTP_502_BAD_GATEWAY,
                                    detail=f"Resposta inválida da API: {raw_content[:100]}"
                                )
                    
                    else:
                        print(f"❌ Status HTTP diferente de 200: {response.status}")
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Erro na API: {response.status}"
                        )
                    
        except aiohttp.ClientError as e:
            print(f"🌐 Erro de rede: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço temporariamente indisponível"
            )
        except Exception as e:
            print(f"💥 Erro inesperado: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro interno: {str(e)}"
            )