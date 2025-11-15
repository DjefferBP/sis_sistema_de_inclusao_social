from .auth import router as auth_router
from .users import router as users_router
from .xp import router as xp_router
from .posts import router as posts_router
from .comments import router as comments_router
from .chat import router as chat_router
from .courses import router as courses_router
from .trabalhos import router as jobs_router

__all__ = [
    "auth_router",
    "users_router", 
    "xp_router",
    "posts_router",
    "comments_router",
    "chat_router",
    "courses_router",
    "jobs_router"
]