import axios from 'axios';
import type { 
  Usuario, UserLogin, UserRegister, UserUpdate, Post, PostCreate, 
  Comentario, CommentCreate, Curso, Conversa, Mensagem, MensagemCreate,
  ApiResponse, PaginatedResponse, ListResponse, UserProgresso,
  PostFilters, CourseFilters, UserFilters, TrabalhoFiltros, VagaTrabalho,
  GrupoVulnerabilidade, NivelTitulo, XPHistorico, EstatisticasUsuario
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Configuração base do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar token às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    
    // Tratamento de erro genérico
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Erro na requisição';
    return Promise.reject(new Error(errorMessage));
  }
);

// Serviços de Autenticação
export const authService = {
  login: async (credentials: UserLogin): Promise<{ access_token: string; token_type: string }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: UserRegister): Promise<{ access_token: string; token_type: string; user: Usuario }> => {
    const response = await api.post('/auth/registrar', userData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    const response = await api.get('/usuarios/me');
    return response.data;
  }
};

// Serviços de Usuários
export const userService = {
  // ✅ ADICIONAR ESTE MÉTODO
  getCurrentUser: async (): Promise<Usuario> => {
    const response = await api.get('/usuarios/me');
    return response.data;
  },

  getUsers: async (filters: UserFilters = {}): Promise<Usuario[]> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get(`/usuarios?${params}`);
    return response.data;
  },

  getUserById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  updateProfile: async (userData: UserUpdate): Promise<Usuario> => {
    const response = await api.put('/usuarios/me', userData);
    return response.data;
  },

  updateProfilePhoto: async (file: File): Promise<{ mensagem: string; tamanho: number; formato: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.put('/usuarios/me/foto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeProfilePhoto: async (): Promise<{ mensagem: string }> => {
    const response = await api.delete('/usuarios/me/foto');
    return response.data;
  },

  getGruposVulnerabilidade: async (): Promise<GrupoVulnerabilidade[]> => {
    const response = await api.get('/usuarios/grupos-vulnerabilidade/disponiveis');
    return response.data;
  }
};

// Serviços de Posts
export const postService = {
  getPosts: async (filters: PostFilters = {}): Promise<ListResponse<Post>> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.usuario_id) params.append('usuario_id', filters.usuario_id.toString());
    
    const response = await api.get(`/posts?${params}`);
    return response.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData: PostCreate): Promise<Post> => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  likePost: async (id: number): Promise<{ curtidas_count: number }> => {
    const response = await api.post(`/posts/${id}/curtir`);
    return response.data;
  },

  unlikePost: async (id: number): Promise<{ curtidas_count: number }> => {
    const response = await api.post(`/posts/${id}/descurtir`);
    return response.data;
  },

  deletePost: async (id: number): Promise<{ mensagem: string }> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  getPostsByUser: async (userId: number, limit: number = 20, offset: number = 0): Promise<ListResponse<Post>> => {
    const response = await api.get(`/posts/usuario/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getPostsByCategory: async (categoria: string, limit: number = 20, offset: number = 0): Promise<ListResponse<Post>> => {
    const response = await api.get(`/posts/categoria/${categoria}?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

// Serviços de Comentários
export const commentService = {
  getCommentsByPost: async (postId: number, limit: number = 50, offset: number = 0): Promise<ListResponse<Comentario>> => {
    const response = await api.get(`/comentarios/post/${postId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getCommentsByUser: async (userId: number, limit: number = 20, offset: number = 0): Promise<ListResponse<Comentario>> => {
    const response = await api.get(`/comentarios/usuario/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  createComment: async (commentData: CommentCreate): Promise<Comentario> => {
    const response = await api.post('/comentarios', commentData);
    return response.data;
  },

  likeComment: async (id: number): Promise<{ curtidas_count: number }> => {
    const response = await api.post(`/comentarios/${id}/curtir`);
    return response.data;
  },

  unlikeComment: async (id: number): Promise<{ curtidas_count: number }> => {
    const response = await api.post(`/comentarios/${id}/descurtir`);
    return response.data;
  },

  deleteComment: async (id: number): Promise<{ mensagem: string }> => {
    const response = await api.delete(`/comentarios/${id}`);
    return response.data;
  }
};

// Serviços de Cursos
export const courseService = {
  getCourses: async (filters: CourseFilters = {}): Promise<ListResponse<Curso>> => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get(`/cursos?${params}`);
    return response.data;
  },

  getCourseById: async (id: number): Promise<Curso> => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },

  getCoursesByArea: async (area: string, limit: number = 20, offset: number = 0): Promise<ListResponse<Curso>> => {
    const response = await api.get(`/cursos/area/${area}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  searchCourses: async (query: string, limit: number = 20, offset: number = 0): Promise<ListResponse<Curso>> => {
    const response = await api.get(`/cursos/buscar/${query}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getAvailableAreas: async (): Promise<string[]> => {
    const response = await api.get('/cursos/areas/disponiveis');
    return response.data.areas || response.data;
  },

  createCourse: async (courseData: any): Promise<Curso> => {
    const response = await api.post('/cursos', courseData);
    return response.data;
  }
};

// Serviços de Chat
export const chatService = {
  getConversations: async (): Promise<Conversa[]> => {
    const response = await api.get('/chat/conversas');
    return response.data;
  },

  getOrCreateConversation: async (usuario2_id: number): Promise<Conversa> => {
    const response = await api.post(`/chat/conversas/${usuario2_id}`);
    return response.data;
  },

  getMessages: async (conversa_id: number, limit: number = 50, offset: number = 0): Promise<ListResponse<Mensagem>> => {
    const response = await api.get(`/chat/conversas/${conversa_id}/mensagens?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  sendMessage: async (conversa_id: number, messageData: MensagemCreate): Promise<Mensagem> => {
    const response = await api.post(`/chat/conversas/${conversa_id}/mensagens`, messageData);
    return response.data;
  },

  getConversationWithMessages: async (conversa_id: number): Promise<{ conversa: Conversa; mensagens: Mensagem[] }> => {
    const response = await api.get(`/chat/conversas/${conversa_id}/completa`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ nao_lidas: number }> => {
    const response = await api.get('/chat/nao-lidas');
    return response.data;
  },

  markAsRead: async (conversa_id: number): Promise<void> => {
    await api.patch(`/chat/conversas/${conversa_id}/ler`);
  }
};

// Serviços de Sistema de XP
export const xpService = {
  getUserProgress: async (): Promise<UserProgresso> => {
    const response = await api.get('/xp/progresso');
    return response.data;
  },

  getXPHistory: async (limit: number = 50): Promise<XPHistorico[]> => {
    const response = await api.get(`/xp/historico?limit=${limit}`);
    return response.data;
  },

  getLevels: async (): Promise<NivelTitulo[]> => {
    const response = await api.get('/xp/niveis');
    return response.data;
  },

  equipTitle: async (titulo_id: number): Promise<{ mensagem: string }> => {
    const response = await api.post(`/xp/titulos/${titulo_id}/equipar`);
    return response.data;
  },

  removeEquippedTitle: async (): Promise<{ mensagem: string }> => {
    const response = await api.post('/xp/titulos/remover');
    return response.data;
  },

  getNextLevelInfo: async (): Promise<{ nivel_atual: number; xp_atual: number; xp_proximo_nivel: number; xp_necessario: number; progresso_percentual: number }> => {
    const response = await api.get('/xp/proximo-nivel');
    return response.data;
  }
};

// Serviços de Trabalhos/Vagas
export const jobService = {
  searchJobs: async (filters: TrabalhoFiltros): Promise<{ vagas: VagaTrabalho[]; total: number; pagina: number }> => {
    const response = await api.post('/trabalhos/vagas', filters);
    return response.data;
  }
};

// Serviços de Estatísticas
export const statsService = {
  getUserStats: async (userId?: number): Promise<EstatisticasUsuario> => {
    const url = userId ? `/estatisticas/usuario/${userId}` : '/estatisticas/me';
    const response = await api.get(url);
    return response.data;
  },

  getSystemStats: async (): Promise<any> => {
    const response = await api.get('/estatisticas/sistema');
    return response.data;
  },

  getCourseStats: async (): Promise<any> => {
    const response = await api.get('/cursos/estatisticas/geral');
    return response.data;
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
export default api;