from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):

    DATABASE_URL: str = "postgresql://postgres:postgres123@localhost:5432/sis_database"
    SECRET_KEY: str = "dfsdyagafhiuhw8yuahjdsnamwjfuierheugdfusyafjksdnhdfbnvdf"  
    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 
    API_KEY: str = "68f79204849c6dd4b51858be"
    

    ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://autotrophically-huffish-arely.ngrok-free.dev",
        "http://autotrophically-huffish-arely.ngrok-free.dev",
        "https://*.ngrok-free.app",
        "https://*.ngrok.io",
        "http://*.ngrok-free.app", 
        "http://*.ngrok.io"
]
    
settings = Settings()