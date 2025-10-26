from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg

from app.core.config import settings
from app.core.database import Database, testar_conexao

from app.routers import (
    auth_router, 
    users_router, 
    xp_router, 
    posts_router, 
    comments_router, 
    chat_router, 
    courses_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("🚀 Iniciando Sistema de Inclusão Social...")
    print(f"📊 Python 3.11.9 - FastAPI {settings.ALLOWED_ORIGINS}")

    conexao_ok = await testar_conexao()
    if not conexao_ok:
        print("❌ ERRO: Não foi possível conectar ao banco de dados!")
        print(f"🔗 DATABASE_URL: {settings.DATABASE_URL}")
        raise Exception("Falha na conexão com o banco de dados")
    
    print("✅ Conexão com banco estabelecida com sucesso!")
    print("✅ Sistema inicializado com sucesso!")
    yield

    print("🔴 Encerrando Sistema de Inclusão Social...")
    await Database.close_pool()
    print("✅ Sistema encerrado com sucesso!")

app = FastAPI(
    title="Sistema de Inclusão Social API",
    description="API para plataforma de inclusão social com sistema gamificado",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Sistema de Inclusão Social API",
        "version": "1.0.0",
        "status": "online",
        "python_version": "3.11.9",
        "docs": "/docs",
        "endpoints_available": [
            "/auth/*",
            "/usuarios/*", 
            "/xp/*",
            "/posts/*",
            "/comentarios/*",
            "/chat/*",
            "/cursos/*"
        ]
    }

@app.get("/health")
async def health_check():

    try:

        conexao_ok = await testar_conexao()
        return {
            "status": "healthy" if conexao_ok else "unhealthy",
            "database": "Conectado" if conexao_ok else "Desconectado",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/info")
async def system_info():
    return {
        "app_name": "Sistema de Inclusão Social",
        "version": "1.0.0",
        "environment": "development",
        "database_url": settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else "hidden",
        "allowed_origins": settings.ALLOWED_ORIGINS
    }

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(xp_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(chat_router)
app.include_router(courses_router)

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Endpoint não encontrado",
        "message": "A rota solicitada não existe",
        "path": request.url.path,
        "available_endpoints": [
            "/auth/registrar", "/auth/login",
            "/usuarios/me", "/usuarios/",
            "/xp/progresso", "/xp/historico",
            "/posts/", "/posts/{id}",
            "/comentarios/", "/comentarios/post/{post_id}",
            "/chat/conversas/", "/chat/mensagens/",
            "/cursos/", "/cursos/{id}"
        ]
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "error": "Erro interno do servidor",
        "message": "Algo deu errado no servidor",
        "path": request.url.path,
        "support": "Contate o administrador do sistema"
    }

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"📍 {request.method} {request.url}")
    response = await call_next(request)
    print(f"✅ {request.method} {request.url} - Status: {response.status_code}")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )