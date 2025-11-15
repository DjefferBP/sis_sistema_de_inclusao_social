// src/services/api.ts - VERSÃO CORRIGIDA E AJUSTADA
import type { 
  Usuario, UserLogin, UserRegister, UserUpdate, Post, PostCreate, 
  Comentario, CommentCreate, Curso, Conversa, Mensagem, MensagemCreate,
  ListResponse, UserProgresso, PostListResponse, CourseListResponse, UserListResponse,
  PostFilters, CourseFilters, UserFilters, TrabalhoFiltros, VagaTrabalho,
  GrupoVulnerabilidade, NivelTitulo, XPHistorico, EstatisticasUsuario
} from '../types';

const getApiBase = (): string => {
  // Se estiver em desenvolvimento (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  
  // Se estiver usando ngrok ou outro tunnel
  if (window.location.hostname.includes('ngrok') || 
      window.location.hostname.includes('localhost.run') ||
      window.location.hostname.endsWith('.loca.lt')) {
    return `${window.location.origin}/api`;
  }
  
  // Para produção (mesma origem)
  return '/api';
};

const API_BASE = getApiBase();

// Função base para fazer requests - VERSÃO CORRIGIDA
async function fetchAPI(
  endpoint: string, 
  options: RequestInit = {}, 
  requiresAuth: boolean = false
) {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Só adiciona o token se a requisição REQUER autenticação
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401 && requiresAuth) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw new Error('Não autorizado');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Erro: ${response.status}`);
  }
  
  return response.json();
}

export const authService = {
   login: async (credentials: UserLogin): Promise<{ access_token: string; token_type: string }> => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  },

  register: async (userData: UserRegister): Promise<any> => {
    return fetchAPI('/auth/registrar', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    return fetchAPI('/usuarios/me', {}, true); // Precisa de auth
  }
};

// Serviços de Usuários - CORRIGIDO
export const userService = {
  getUsers: async (filters: UserFilters = {}): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.cidade) params.append('cidade', filters.cidade);
    
    const query = params.toString();
    return fetchAPI(`/usuarios/${query ? `?${query}` : ''}`, {}, true);
  },

  getUserById: async (id: number): Promise<Usuario> => {
    return fetchAPI(`/usuarios/${id}`, {}, true);
  },

  getCurrentUser: async (): Promise<Usuario> => {
    return fetchAPI('/usuarios/me', {}, true);
  },

  updateProfile: async (userData: UserUpdate): Promise<Usuario> => {
    return fetchAPI('/usuarios/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, true);
  },

  updateProfilePhoto: async (file: File): Promise<{ mensagem: string; tamanho: number; formato: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/usuarios/me/foto`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('Falha ao atualizar foto');
    return response.json();
  },

  removeProfilePhoto: async (): Promise<{ mensagem: string }> => {
    return fetchAPI('/usuarios/me/foto', {
      method: 'DELETE',
    }, true);
  },

  getGruposVulnerabilidade: async (): Promise<GrupoVulnerabilidade[]> => {
    return fetchAPI('/usuarios/grupos-vulnerabilidade/disponiveis', {});
  }
};

// Serviços de Posts - CORRIGIDO
export const postService = {
  getPosts: async (filters: PostFilters = {}): Promise<PostListResponse> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.usuario_id) params.append('usuario_id', filters.usuario_id.toString());
    
    const query = params.toString();
    return fetchAPI(`/posts/${query ? `?${query}` : ''}`, {}, true);
  },

  getPostById: async (id: number): Promise<Post> => {
    return fetchAPI(`/posts/${id}`, {}, true);
  },

  createPost: async (postData: PostCreate): Promise<Post> => {
    return fetchAPI('/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    }, true);
  },

  likePost: async (id: number): Promise<{ curtidas_count: number }> => {
    return fetchAPI(`/posts/${id}/curtir`, {
      method: 'POST',
    }, true);
  },

  unlikePost: async (id: number): Promise<{ curtidas_count: number }> => {
    return fetchAPI(`/posts/${id}/descurtir`, {
      method: 'POST',
    }, true);
  },

  deletePost: async (id: number): Promise<{ mensagem: string }> => {
    return fetchAPI(`/posts/${id}`, {
      method: 'DELETE',
    }, true);
  },

  getPostsByUser: async (userId: number, limit: number = 20, offset: number = 0): Promise<ListResponse<Post>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/posts/usuario/${userId}${query ? `?${query}` : ''}`, {}, true);
  },

  getPostsByCategory: async (categoria: string, limit: number = 20, offset: number = 0): Promise<ListResponse<Post>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/posts/categoria/${categoria}${query ? `?${query}` : ''}`, {}, true);
  },

  // Novos métodos baseados nas rotas
  getPostStats: async (id: number): Promise<any> => {
    return fetchAPI(`/posts/${id}/estatisticas`, {}, true);
  },

  checkPostLike: async (id: number): Promise<{ curtido: boolean }> => {
    return fetchAPI(`/posts/${id}/curtido`, {}, true);
  }
};

// Serviços de Comentários - CORRIGIDO
export const commentService = {
  getCommentsByPost: async (postId: number, limit: number = 50, offset: number = 0): Promise<ListResponse<Comentario>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/comentarios/post/${postId}${query ? `?${query}` : ''}`, {}, true);
  },

  getCommentsByUser: async (userId: number, limit: number = 20, offset: number = 0): Promise<ListResponse<Comentario>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/comentarios/usuario/${userId}${query ? `?${query}` : ''}`, {}, true);
  },

  createComment: async (commentData: CommentCreate): Promise<Comentario> => {
    return fetchAPI('/comentarios/', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }, true);
  },

  likeComment: async (id: number): Promise<{ curtidas_count: number }> => {
    return fetchAPI(`/comentarios/${id}/curtir`, {
      method: 'POST',
    }, true);
  },

  unlikeComment: async (id: number): Promise<{ curtidas_count: number }> => {
    return fetchAPI(`/comentarios/${id}/descurtir`, {
      method: 'POST',
    }, true);
  },

  deleteComment: async (id: number): Promise<{ mensagem: string }> => {
    return fetchAPI(`/comentarios/${id}`, {
      method: 'DELETE',
    }, true);
  },

  getCommentById: async (id: number): Promise<Comentario> => {
    return fetchAPI(`/comentarios/${id}`, {}, true);
  }
};

// Serviços de Cursos - CORRIGIDO
export const courseService = {
  getCourses: async (filters: CourseFilters = {}): Promise<CourseListResponse> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/cursos/${query ? `?${query}` : ''}`, {}, true);
  },

  getCourseById: async (id: number): Promise<Curso> => {
    return fetchAPI(`/cursos/${id}`, {}, true);
  },

  getCoursesByArea: async (area: string, limit: number = 20, offset: number = 0): Promise<CourseListResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/cursos/area/${area}${query ? `?${query}` : ''}`, {}, true);
  },

  searchCourses: async (query: string, limit: number = 20, offset: number = 0): Promise<CourseListResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const searchQuery = params.toString();
    return fetchAPI(`/cursos/buscar/${encodeURIComponent(query)}${searchQuery ? `?${searchQuery}` : ''}`, {}, true);
  },

  getAvailableAreas: async (): Promise<string[]> => {
    const data = await fetchAPI('/cursos/areas/disponiveis', {}, true);
    return data.areas || data;
  },

  createCourse: async (courseData: any): Promise<Curso> => {
    return fetchAPI('/cursos/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }, true);
  },

  getCourseStats: async (): Promise<any> => {
    return fetchAPI('/cursos/estatisticas/geral', {}, true);
  }
};

// services/api.ts - CHAT SERVICE CORRIGIDO
export const chatService = {
  // ✅ EXISTE: Listar Conversas
  getConversations: async (): Promise<Conversa[]> => {
    return fetchAPI('/chat/conversas/', {}, true);
  },

  // ✅ EXISTE: Iniciar Conversa
  createConversation: async (usuario2_id: number): Promise<Conversa> => {
    return fetchAPI(`/chat/conversas/${usuario2_id}`, {
      method: 'POST',
    }, true);
  },

  // ✅ EXISTE: Obter Mensagens Conversa
  getMessages: async (conversa_id: number, limit: number = 50, offset: number = 0): Promise<ListResponse<Mensagem>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString();
    return fetchAPI(`/chat/conversas/${conversa_id}/mensagens${query ? `?${query}` : ''}`, {}, true);
  },

  // ✅ EXISTE: Enviar Mensagem
  sendMessage: async (conversa_id: number, mensagem: string): Promise<Mensagem> => {
    return fetchAPI(`/chat/conversas/${conversa_id}/mensagens`, {
      method: 'POST',
      body: JSON.stringify({ 
        conversa_id, 
        mensagem 
      }),
    }, true);
  },

  // ✅ EXISTE: Obter Conversa Completa
  getConversationWithMessages: async (conversa_id: number): Promise<{ conversa: Conversa; mensagens: Mensagem[] }> => {
    return fetchAPI(`/chat/conversas/${conversa_id}/completa`, {}, true);
  },

  // ✅ EXISTE: Obter Nao Lidas Count
  getUnreadCount: async (): Promise<{ nao_lidas: number }> => {
    return fetchAPI('/chat/nao-lidas', {}, true);
  },

  // ✅ EXISTE: Buscar Conversa Usuarios
  findConversation: async (usuario2_id: number): Promise<Conversa> => {
    return fetchAPI(`/chat/buscar-conversa/${usuario2_id}`, {}, true);
  }

  // ❌ REMOVIDO: markAsRead (não existe na lista)
  // ❌ REMOVIDO: getOrCreateConversation (duplicado)
};

// Serviços de Sistema de XP - CORRIGIDO
// Serviços de Sistema de XP - VERIFIQUE SE EXISTE
export const xpService = {
  getUserProgress: async (): Promise<UserProgresso> => {
    return fetchAPI('/xp/progresso', {}, true);
  },

  getXPHistory: async (limit: number = 50): Promise<XPHistorico[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString();
    return fetchAPI(`/xp/historico${query ? `?${query}` : ''}`, {}, true);
  },

  getLevels: async (): Promise<NivelTitulo[]> => {
    return fetchAPI('/xp/niveis', {}, true);
  },

  equipTitle: async (titulo_id: number): Promise<{ mensagem: string }> => {
    return fetchAPI(`/xp/titulos/${titulo_id}/equipar`, {
      method: 'POST',
    }, true);
  },

  removeEquippedTitle: async (): Promise<{ mensagem: string }> => {
    return fetchAPI('/xp/titulos/remover', {
      method: 'POST',
    }, true);
  },

  getNextLevelInfo: async (): Promise<any> => {
    return fetchAPI('/xp/proximo-nivel', {}, true);
  }
};

// Serviços de Trabalhos/Vagas - CORRIGIDO
export const jobService = {
  searchJobs: async (filters: TrabalhoFiltros): Promise<{ vagas: VagaTrabalho[]; total: number; pagina: number }> => {
    return fetchAPI('/trabalhos/vagas', {
      method: 'POST',
      body: JSON.stringify(filters),
    }, true);
  }
};

// Serviços de Estatísticas - CORRIGIDO
export const statsService = {
  getUserStats: async (userId?: number): Promise<EstatisticasUsuario> => {
    const url = userId ? `/estatisticas/usuario/${userId}` : '/estatisticas/me';
    return fetchAPI(url, {}, true);
  },

  getSystemStats: async (): Promise<any> => {
    return fetchAPI('/estatisticas/sistema', {}, true);
  }
};

// Utilitários da API
export const apiUtils = {
  setAuthToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  getAuthToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeAuthToken: (): void => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  }
};



// Exportação padrão
export default { 
  authService, 
  userService, 
  postService, 
  commentService, 
  courseService, 
  chatService, 
  xpService, 
  jobService, 
  statsService, 
  apiUtils ,
  fetchAPI
};