# app/models/__init__.py
from .trabalhos import TrabalhosBase

from .user import (
    UserBase, UserCreate, UserLogin, UserResposta, 
    UserUpdate, UserProfileResponse
)

from .xp import (
    NivelTituloBase, NivelTituloResponse,
    AcaoXPBase, AcaoXPResponse,
    XPHistoricoBase, XPHistoricoResponse,
    GrupoVulnerabilidadeBase, GrupoVulnerabilidadeResponse,
    UserProgressoResponse
)

from .post import (
    PostBase, PostCreate, PostResponse,
    PostListResponse
)

from .comment import (
    CommentBase, CommentCreate, CommentResponse
)

from .chat import (
    ConversaBase, ConversaResponse,
    MensagemBase, MensagemCreate, MensagemResponse,
    ConversaWithMessagesResponse
)

from .course import (
    CourseBase, CourseCreate, CourseUpdate, CourseResponse,
    CourseListResponse
)

from .trabalhos import (
    TrabalhosBase
)