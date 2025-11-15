import asyncio
import asyncpg
DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/sis_database"
CURSOS_SEBRAE = [
    {
        "id": 1,
        "titulo": "Marketing digital para sua empresa: primeiros passos",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/marketing-digital-para-sua-empresa-primeiros-passos,1d4740b4a19a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 9h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 2,
        "titulo": "Análise de resultados em marketing digital",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/analise-de-resultados-em-marketing-digital,6b1140b4a19a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 7h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 3,
        "titulo": "Marketing digital e redes sociais",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/marketing-digital-e-redes-sociais,813163edc63c8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 7h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 4,
        "titulo": "Marketing digital para sua empresa: equipe comercial",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/marketing-digital-para-sua-empresa-equipe-comercial,a0f263edc63c8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 5,
        "titulo": "Marketing digital: estratégias e práticas para conquistar clientes",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/marketing-digital-estrategias-e-aplicacoes-para-conquistar-clientes,01245da9bca37910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 8h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 6,
        "titulo": "Como definir o preço de venda",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-definir-o-preco-de-venda,73c7225a693a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_como_definir_preco_venda-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_como_definir_preco_venda.png",
        "duracao": "Duração 6h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 7,
        "titulo": "Gestão Financeira",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-financeira,e059d743ad3a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Gestao_Financeira-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Gestao_Financeira.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 8,
        "titulo": "Microcrédito consciente",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/microcredito-consciente,c9fcd743ad3a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Microcredito_consciente-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Microcredito_consciente.png",
        "duracao": "Duração 4h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 9,
        "titulo": "Como controlar o fluxo de caixa",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-controlar-o-fluxo-de-caixa,9ca0225a693a8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_como_controlar_fluxo_de_caixa-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_como_controlar_fluxo_de_caixa.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 10,
        "titulo": "Formação pedagógica: empreendedorismo e BNCC",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/formacao-pedagogica,55ee16d291e4d710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_empreendedorismo-formacao-pedagogica_pexels-5915202.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_empreendedorismo-formacao-pedagogica_pexels-5915202.png.png",
        "duracao": "Duração 40h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Educação & Ensino"
    },
    {
        "id": 11,
        "titulo": "Inteligência emocional",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/inteligencia-emocional,b13defadd8608810VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_inteligencia-emocional_shutterstock-1224867562-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_inteligencia-emocional_shutterstock-1224867562.png",
        "duracao": "Duração 15h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 12,
        "titulo": "Flow - Conversas Difíceis",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/flow-conversas-dificeis,0268ec3723da2810VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_Flow-Conversas-dif%C3%ADceis_shutterstock-633397733-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_Flow-Conversas-difíceis_shutterstock-633397733.png",
        "duracao": "Duração 1h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 13,
        "titulo": "Curso de liderança - Líder Coach: liderando para a alta performance",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/lider-coach-liderando-para-a-alta-performance,1256222d74348710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_lider-coach_Shutterstock-1606120399-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_lider-coach_Shutterstock-1606120399.png",
        "duracao": "Duração 16h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 14,
        "titulo": "Como desenvolver uma mentalidade empreendedora de sucesso",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-desenvolver-uma-mentalidade-empreendedora-de-sucesso,12de56f0ba7e8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_empreendedor-de-sucesso-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/card_empreendedor-de-sucesso.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 15,
        "titulo": "Criatividade",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/criatividade,5090b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_criatividade_shutterstock_562155895.-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_criatividade_shutterstock_562155895..png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 16,
        "titulo": "A Liderança na gestão de equipes",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/lideranca-na-gestao-de-equipes,61b0c094cd279910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Lideran%C3%A7a%20na%20Gest%C3%A3o%20de%20Equipes-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/card_Liderança na Gestão de Equipes.png",
        "duracao": "Duração 7h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 17,
        "titulo": "JEPP Professor: 8º ano - Tecnologias digitais e soluções",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/jovens-empreendedores-primeiros-passos-8-ano-professor,70b07f680efbd710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Capa/Atualizados/capa_jepp_novo-professor-8%C2%B0ano-tecnologias-digitais-e-solucoes-empreendedoras_shutterstock-260153099-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Capa/Atualizados/capa_jepp_novo-professor-8°ano-tecnologias-digitais-e-solucoes-empreendedoras_shutterstock-260153099.png",
        "duracao": "Duração 15h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Educação & Ensino"
    },
    {
        "id": 18,
        "titulo": "Cultura digital e PBL",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/cultura-digital-e-pbl,7c1f1fef5bf39710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_cultura-digital-pbl_shutterstock-2111420681-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_cultura-digital-pbl_shutterstock-2111420681.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 19,
        "titulo": "Liderança eficaz: guia para pequenos negócios",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/lideranca-eficaz-guia-para-pequenos-negocios,88b87a50d18e8910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Lideran%C3%A7a%20Eficaz-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/card_Liderança Eficaz.png",
        "duracao": "Duração 7h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 20,
        "titulo": "Palestra empreendedorismo em dois tempos",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/palestra-empreendedorismo-em-dois-tempos,952f1fef5bf39710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_palestra-empreendedorismo-dois-tempo_shutterstock-701467699-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_palestra-empreendedorismo-dois-tempo_shutterstock-701467699.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 21,
        "titulo": "Curso empreendedorismo - Identidade empreendedora",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/identidade-empreendedora,9890b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card-identidade-empreendedora-shutterstock_1090334834.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card-identidade-empreendedora-shutterstock_1090334834.png.png",
        "duracao": "Duração 1h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 22,
        "titulo": "LGPD para gestão pública",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/lgpd-para-gestao-publica,61a37a2454ed7810VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_lgpd-gestao-publica_shutterstock-2270275033-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_lgpd-gestao-publica_shutterstock-2270275033.png",
        "duracao": "Duração 6h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Setor Público"
    },
    {
        "id": 23,
        "titulo": "Trade marketing",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/trade-marketing,90fea2a16b76e710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card-marketing-Trade-Marketing_shutterstock-623576681-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card-marketing-Trade-Marketing_shutterstock-623576681.png",
        "duracao": "Duração 4h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 24,
        "titulo": "Modelagem e validação da proposta de valor para Startups",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/modelagem-e-validacao-da-proposta-de-valor-para-startups,01cbb71da3b00710VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_modelagem-validacao-proposta-valor-startups_shutterstock_1100733734-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_modelagem-validacao-proposta-valor-startups_shutterstock_1100733734.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 25,
        "titulo": "Curso Inovação de impacto para startups",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/inovacao-de-impacto-para-startups,3cb592c37fa00710VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_inovacao-impacto-startups_shutterstock_1195972408.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_inovacao-impacto-startups_shutterstock_1195972408.png.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 26,
        "titulo": "Curso ESG para pequenas empresas",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/esg-para-pequenas-empresas,591bc39816483810VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_ESG-pequenos-negocios_shutterstock-2074532254-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_ESG-pequenos-negocios_shutterstock-2074532254.png",
        "duracao": "Duração 15h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "ESG & Sustentabilidade"
    },
    {
        "id": 27,
        "titulo": "Introdução ao BIM para pequenas empresas",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/introducao-ao-bim-para-pequenas-empresas,05f37a0655786710VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_introducao-BIM-pequenas-empresas_89560-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_introducao-BIM-pequenas-empresas_89560.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 28,
        "titulo": "Gestão empresarial integrada",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-empresarial-integrada,1270b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_gestao-empresarial-integrada_iStock-951514270-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_gestao-empresarial-integrada_iStock-951514270.png",
        "duracao": "Duração 15h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 29,
        "titulo": "Design traz inovação e destaca sua empresa da concorrência",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/design-na-empresa,1390b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_design-na-empresa_iStock-898079598-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_design-na-empresa_iStock-898079598.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 30,
        "titulo": "Gestão de pessoas - Formação de equipes como estratégia de sucesso",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/formacao-de-equipes-como-estrategia-de-sucesso,15e0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_formacao-equipes-como-estrategia-sucesso_shutterstock_1142615684-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_formacao-equipes-como-estrategia-sucesso_shutterstock_1142615684.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 31,
        "titulo": "Exportação: seu negócio cruzando fronteiras",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/exportacao-seu-negocio-cruzando-fronteiras,1ad0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_exportacao-negocio-cruzando-fronteiras_shutterstock-2114883164-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_exportacao-negocio-cruzando-fronteiras_shutterstock-2114883164.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Comércio Exterior"
    },
    {
        "id": 32,
        "titulo": "Curso Inovação e possibilidades de crescimento",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/inovacao-e-possibilidades-de-crescimento,1ca6464a23538810VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_inovacao-e-possibilidade-de-crescimento-shutterstock_2278450133-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_inovacao-e-possibilidade-de-crescimento-shutterstock_2278450133.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 33,
        "titulo": "Expansão: a estratégia de crescimento certa para seu negócio",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/expansao-a-estrategia-de-crescimento-certa-para-seu-negocio,2401b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_expansao-estrategia-crescimento-negocio_iStock-832112086-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_expansao-estrategia-crescimento-negocio_iStock-832112086.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 34,
        "titulo": "MEG na avaliação da gestão de negócios",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/meg-na-avaliacao-da-gestao-de-negocios,3670b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_MEG-gest%C3%A3o_iStock-887882750.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_MEG-gestão_iStock-887882750.png.png",
        "duracao": "Duração 12h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 35,
        "titulo": "Financiamento para empresas - Como captar recursos para o seu negócio",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-captar-recursos-para-o-seu-negocio,3790b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_como-captar-recursos-negocios_shutterstock_1827770870-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_como-captar-recursos-negocios_shutterstock_1827770870.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 36,
        "titulo": "Gestão de equipe de vendas",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-de-equipe-de-vendas,37bfc094cd279910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_Gest%C3%A3o%20de%20Equipe%20de%20Vendas-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/card_Gestão de Equipe de Vendas.png",
        "duracao": "Duração 5h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Marketing & Vendas"
    },
    {
        "id": 37,
        "titulo": "Negociação",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/negociacao,3c80b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_negociaco_pexels-tima-miroshnichenko-5717509-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_negociaco_pexels-tima-miroshnichenko-5717509.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 38,
        "titulo": "Responsabilidade social empresarial",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/responsabilidade-social-empresarial,3ed0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_responsabilidade-social-empresarial_shutterstock_182134271.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_responsabilidade-social-empresarial_shutterstock_182134271.png.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 39,
        "titulo": "Curso sobre parcerias - Como unir forças para crescer",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-unir-forcas-para-crescer,67c0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_como-unir-forcas-crescer_shutterstock-414838831-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_como-unir-forcas-crescer_shutterstock-414838831.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 40,
        "titulo": "InovaGov",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/inovagov,7654a8c3f4608810VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_inovago_shutterstock-1994040023-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_inovago_shutterstock-1994040023.png",
        "duracao": "Duração 12h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Setor Público"
    },
    {
        "id": 41,
        "titulo": "Como ter ideias criativas e inovar na prática?",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/como-ter-ideias-criativas-e-inovar-na-pratica,7980b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_ideias-criativas-inovar-pratica_iStock-898680980-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_ideias-criativas-inovar-pratica_iStock-898680980.png",
        "duracao": "Duração 1h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 42,
        "titulo": "Gestão financeira – tenha uma estratégia para sua empresa crescer",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/estrategia-financeira-para-o-crescimento,7bd0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_estrategia-financeira-crescimento_shutterstock_1238066593-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_estrategia-financeira-crescimento_shutterstock_1238066593.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 43,
        "titulo": "Iniciando na importação",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/iniciando-na-importacao,7ca0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_iniciando-importacao_shutterstock_1112845271-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_iniciando-importacao_shutterstock_1112845271.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Comércio Exterior"
    },
    {
        "id": 44,
        "titulo": "Curso para o Agronegócio: Avaliação da Gestão na Propriedade Rural",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/avaliacao-da-gestao-na-propriedade-rural,7ec0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_avaliacao-gestao-propriedade-rural_iStock-959523280-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_avaliacao-gestao-propriedade-rural_iStock-959523280.png",
        "duracao": "Duração 8h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Agronegócio"
    },
    {
        "id": 45,
        "titulo": "Internacionalização para o Audiovisual",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/internacionalizacao-para-o-audiovisual,817dc7681e212810VgnVCM100000d701210aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 34h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Indústrias Criativas"
    },
    {
        "id": 46,
        "titulo": "Curso Qualidade do atendimento ao cliente",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/qualidade-no-atendimento-ao-cliente,b680b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Liderança & Gestão de Pessoas"
    },
    {
        "id": 47,
        "titulo": "Quanto vale a minha empresa?",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/quanto-vale-a-minha-empresa,bee0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 6h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 48,
        "titulo": "Inovação",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/inovacao,ce90b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "",
        "imagem_png": "",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Inovação & Tecnologia"
    },
    {
        "id": 49,
        "titulo": "Sucessão empresarial",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/sucessao-empresarial,d2f0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_sucessao-empresarial_shutterstock_165329219-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_sucessao-empresarial_shutterstock_165329219.png",
        "duracao": "Duração 3h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 50,
        "titulo": "Gestão financeira para moda",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/gestao-financeira-para-moda,d37224c60c39a810VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_gest%C3%A3o-financeira-para-moda_shutterstock-448358068-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_gestão-financeira-para-moda_shutterstock-448358068.png",
        "duracao": "Duração 16h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 51,
        "titulo": "Curso Internacionalização de Startups",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/internacionalizacao-de-startups,e92f4ac1a947d610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_internacionalizacao-startups_shutterstock_1244257078-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_internacionalizacao-startups_shutterstock_1244257078.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Comércio Exterior"
    },
    {
        "id": 52,
        "titulo": "Planejamento financeiro para acesso ao crédito",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/planejamento-financeiro-para-acesso-ao-credito,ef2d5f73d3f98910VgnVCM1000001b00320aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/card_planejamento%20financeiro%20acesso%20ao_cr%C3%A9dito-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/card_planejamento financeiro acesso ao_crédito.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Financeira"
    },
    {
        "id": 53,
        "titulo": "Curso Importação: como comprar do mundo",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/importacao-como-comprar-do-mundo,f0e0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card-importa%C3%A7ao-como-comprar-do-mundo-pexels-tiger-lily-4483610.png-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card-importaçao-como-comprar-do-mundo-pexels-tiger-lily-4483610.png.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Comércio Exterior"
    },
    {
        "id": 54,
        "titulo": "Boas práticas como diferencial na gestão das propriedades rurais",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/boas-praticas-como-diferencial-na-gestao-das-propriedades-rurais,f601b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_diferencial-gestao-propriedades-rurais_iStock-955191688-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_diferencial-gestao-propriedades-rurais_iStock-955191688.png",
        "duracao": "Duração 4h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Agronegócio"
    },
    {
        "id": 55,
        "titulo": "Exportar: sua empresa também pode",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/exportar-sua-empresa-tambem-pode,fbe0b8a6a28bb610VgnVCM1000004c00210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_exportar-empresa-tambem-pode-pexels-tom-fisk-2226458-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_exportar-empresa-tambem-pode-pexels-tom-fisk-2226458.png",
        "duracao": "Duração 10h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Comércio Exterior"
    },
    {
        "id": 56,
        "titulo": "Curso para MEI - Super MEI: organize seu negócio",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/super-mei-organize-seu-negocio,260f56c2a69a8710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_trilha_super-mei-organize-seu-neg%C3%B3cio_shutterstock709205902-09-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_trilha_super-mei-organize-seu-negócio_shutterstock709205902-09.png",
        "duracao": "Duração 12h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "MEI (Microempreendedor Individual)"
    },
    {
        "id": 57,
        "titulo": "Reinventar-se e superar a crise",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/reinventar-se-e-superar-a-crise,51019a9708f3a710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_curso-reinventar-se-superar-crise_shutterstock_1850405665-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_curso-reinventar-se-superar-crise_shutterstock_1850405665.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Empreendedorismo & Desenvolvimento Pessoal"
    },
    {
        "id": 58,
        "titulo": "Curso Associativismo e cooperativismo: a união faz a força",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/associativismo-e-cooperativismo-a-uniao-faz-a-forca,54a5d4e21eeeb710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_curso-associativismo-cooperativismo-uniao-forca_pexels-zen-chung-5529604-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_curso-associativismo-cooperativismo-uniao-forca_pexels-zen-chung-5529604.png",
        "duracao": "Duração 2h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "Gestão Empresarial Estratégica"
    },
    {
        "id": 59,
        "titulo": "Curso de gestão para o MEI - Super MEI: pronto para crescer",
        "descricao": "Curso oferecido pelo SEBRAE",
        "url": "https://sebrae.com.br/sites/PortalSebrae/cursosonline/super-mei-pronto-para-crescer,fd5156c2a69a8710VgnVCM100000d701210aRCRD",
        "imagem_webp": "https://sebrae.com.br/Sebrae/Portal%20Sebrae/EAD2/Card-Destaque/Atualizados/card_trilha_super-mei-pronto-para-crescer_shutterstock1196903902-09-webp.webp",
        "imagem_png": "https://sebrae.com.br/Sebrae/Portal Sebrae/EAD2/Card-Destaque/Atualizados/card_trilha_super-mei-pronto-para-crescer_shutterstock1196903902-09.png",
        "duracao": "Duração 12h",
        "modalidade": "Online",
        "categoria": "sebrae",
        "area": "MEI (Microempreendedor Individual)"
    }
];

async def popular_cursos():
    print("🚀 Iniciando população de cursos do SEBRAE...")
    
    conn = None
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        count_existentes = await conn.fetchval("SELECT COUNT(*) FROM cursos")
        print(f"📊 Cursos existentes no banco: {count_existentes}")
        
        cursos_adicionados = 0
        cursos_ignorados = 0
        
        for i, curso_data in enumerate(CURSOS_SEBRAE, 1): 
            existe = await conn.fetchrow(
                "SELECT id FROM cursos WHERE titulo = $1",
                curso_data["titulo"]
            )
            
            if existe:
                cursos_ignorados += 1
                continue

            imagem_url = curso_data["imagem_webp"] or curso_data["imagem_png"] or ""
            
            await conn.execute(
                """INSERT INTO cursos 
                   (titulo, descricao, url_curso, imagem_url, modalidade, area, carga_horaria)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                curso_data["titulo"], 
                curso_data["descricao"], 
                curso_data["url"],
                imagem_url,
                curso_data["modalidade"],
                curso_data["area"],
                curso_data['duracao'],
            )
            
            cursos_adicionados += 1
        
        total_final = await conn.fetchval("SELECT COUNT(*) FROM cursos")
        print(f"Adicionados: {cursos_adicionados}")
        print(f"Ignorados: {cursos_ignorados}")
        print(f"Total: {total_final}")
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            await conn.close()

if __name__ == "__main__":
    asyncio.run(popular_cursos())