import aiohttp
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
            periodo = dados.sort_by.strip().lower() if dados.sort_by else None
            nvl_exp = dados.experience_level.strip().lower() if dados.experience_level else None
            tipo_trabalho = dados.work_type.strip().lower() if dados.work_type else None
            tipo_servico = dados.job_type.strip().lower() if dados.job_type else None
            
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
            
            if periodo == "dia" or periodo == "day":
                params["sort_by"] = "day"
            elif periodo == "semana" or periodo == "week" or periodo == "semana":
                params["sort_by"] = "week"
            elif periodo == "mês" or periodo == "month" or periodo == "mes":
                params["sort_by"] = "month"
            
            if nvl_exp == "estágio" or nvl_exp == "estagio" or nvl_exp == "internship":
                params["exp_level"] = "internship"
            elif nvl_exp == "iniciante" or nvl_exp == "júnior" or nvl_exp == "junior" or nvl_exp == "entry":
                params["exp_level"] = "entry"
            elif nvl_exp == "pleno" or nvl_exp == "associado" or nvl_exp == "associate" or nvl_exp == "mid":
                params["exp_level"] = "mid"
            elif nvl_exp == "sênior" or nvl_exp == "senior" or nvl_exp == "experiente":
                params["exp_level"] = "senior"
            elif nvl_exp == "diretor" or nvl_exp == "director" or nvl_exp == "liderança":
                params["exp_level"] = "director"

            if tipo_servico == "tempo integral" or tipo_servico == "integral" or tipo_servico == "full_time":
                params["job_type"] = "full_time"
            elif tipo_servico == "meio período" or tipo_servico == "meio-período" or tipo_servico == "part_time":
                params["job_type"] = "part_time"
            elif tipo_servico == "contrato" or tipo_servico == "contract":
                params["job_type"] = "contract"
            elif tipo_servico == "temporário" or tipo_servico == "temporario" or tipo_servico == "temporary":
                params["job_type"] = "temporary"
            elif tipo_servico == "voluntário" or tipo_servico == "voluntario" or tipo_servico == "volunteer":
                params["job_type"] = "volunteer"
            elif tipo_servico == "estágio" or tipo_servico == "estagio" or tipo_servico == "internship":
                params["job_type"] = "internship"
            
            if tipo_trabalho == "presencial" or tipo_trabalho == "atwork":
                params["work_type"] = "atwork"
            elif tipo_trabalho == "remoto" or tipo_trabalho == "remote":
                params["work_type"] = "remote"
            elif tipo_trabalho == "híbrido" or tipo_trabalho == "hibrido" or tipo_trabalho == "hybrid":
                params["work_type"] = "hybrid"
        

            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    
                    if response.status != 200:
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Erro na API de vagas: {response.status}"
                        )
                    
                    data = await response.json()
                    

                    if not data:
                        return {
                            "sucesso": True,
                            "total_vagas": 0,
                            "vagas": [],
                            "mensagem": "Nenhuma vaga encontrada com os filtros fornecidos",
                            "filtros_usados": params
                        }
                    
                    return {
                        "sucesso": True,
                        "total_vagas": len(data),
                        "vagas": data,
                        "filtros_usados": params
                    }
                    
        except aiohttp.ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço de vagas temporariamente indisponível"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao buscar vagas"
            )