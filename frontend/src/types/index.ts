
export interface GrupoVulnerabilidade {
  id: number;
  categoria: string;
  tipo: string;
  created_at?: string;
}

export interface NivelTitulo {
  id: number;
  nivel: number;
  xp_necessario: number;
  titulo: string;
  descricao?: string;
  created_at?: string;
}
export interface AcaoXP {
  id: number;
  acao: string;
  xp_ganho: number;
  descricao?: string;
  created_at?: string;
}

export interface XPHistorico {
  id: number;
  usuario_id: number;
  acao: string;
  xp_ganho: number;
  descricao?: string;
  data_acao: string;
  created_at?: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  foto_perfil?: string | null;
  xp_atual: number;
  nivel_atual: number;
  titulo_equipado_id?: number | null;
  bio?: string;
  created_at: string;
  updated_at?: string;
  grupos_vulnerabilidade: GrupoVulnerabilidade[];
}

// Em types.ts, atualize a interface Post:
export interface Post {
  id: number;
  usuario_id: number;
  titulo: string;
  conteudo: string;
  categoria?: string;
  curtidas_count: number;
  comentarios_count: number;
  created_at: string;
  updated_at: string;
  autor_nome?: string;
  curtido?: boolean; 
}

export interface Comentario {
  id: number;
  post_id: number;
  usuario_id: number;
  conteudo: string;
  curtidas_count: number;
  created_at: string;
  updated_at: string;
  autor_nome?: string;
  post_titulo?: string;
}

export interface Curso {
  id: number;
  titulo: string;
  descricao?: string;
  url_curso: string;
  imagem_url?: string;
  modalidade?: string;
  area?: string;
  carga_horaria?: number;
  gratuito?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversa {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  data_criacao: string;
  ultima_mensagem?: string;
  created_at: string;
  outro_usuario_nome?: string;
  outro_usuario_avatar?: string;
}

export interface Mensagem {
  id: number;
  conversa_id: number;
  remetente_id: number;
  mensagem: string;
  data_envio: string;
  lida: boolean;
  created_at: string;
  remetente_nome?: string;
}

export interface Notificacao {
  id: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  created_at: string;
}

// Tipos para autenticação
export interface UserLogin {
  email: string;
  senha: string;
}

export interface UserRegister {
  nome: string;
  email: string;
  senha: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bio?: string;
  grupos_vulnerabilidade: number[];
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user?: Usuario; 
}

export interface UserUpdate {
  nome?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  bio?: string;
  grupos_vulnerabilidade?: number[];
}

// Tipos para criação de conteúdo
export interface PostCreate {
  titulo: string;
  conteudo: string;
  categoria?: string;
}

export interface CommentCreate {
  post_id: number;
  conteudo: string;
}

export interface MensagemCreate {
  conversa_id: number;
  mensagem: string;
}

export interface CourseCreate {
  titulo: string;
  descricao?: string;
  url_curso: string;
  imagem_url?: string;
  modalidade?: string;
  area?: string;
  carga_horaria?: number;
  gratuito?: string;
}

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ListResponse<T> {
  [key: string]: any; // ✅ Permite qualquer chave, mas precisamos tipar o uso
  items?: T[]; // ✅ Adicionamos items opcional
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// INTERFACES ESPECÍFICAS para cada tipo de resposta
export interface PostListResponse {
  posts: Post[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface UserListResponse {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface CourseListResponse {
  cursos: Curso[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface CommentListResponse {
  comentarios: Comentario[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// Adicione esta interface para a resposta real da API
export interface VagaTrabalhoAPI {
  job_position: string;
  job_link: string;
  job_id: string;
  company_name: string;
  company_profile: string;
  job_location: string;
  job_posting_date: string;
  company_logo_url?: string;
}

export interface TrabalhoResponse {
  sucesso: boolean;
  total_vagas: number;
  vagas: VagaTrabalhoAPI[];
  filtros_usados: any;
  mensagem?: string;
}

// MELHOR AINDA: Criar interfaces específicas para cada resposta
export interface PostListResponse {
  posts: Post[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface UserListResponse {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface CourseListResponse {
  cursos: Curso[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface UserProgresso {
  usuario_id: number;
  xp_atual: number;
  nivel_atual: number;
  titulo_equipado?: string; 
  titulo_equipado_id?: number;
}

export interface ProximoNivel {
  nivel_atual: number;
  xp_atual: number;
  xp_proximo_nivel: number;
  xp_necessario: number;
  progresso_percentual: number;
}

// Tipos para filtros e buscas
export interface PostFilters {
  categoria?: string;
  usuario_id?: number;
  limit?: number;
  offset?: number;
}

export interface CourseFilters {
  area?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface UserFilters {
  limit?: number;
  offset?: number;
  estado?: string;
  cidade?: string;
}

// Tipos para trabalhos/vagas
export interface TrabalhoFiltros {
  field?: string;
  location?: string;
  page?: number;
  sort_by?: string;
  job_type?: string;
  experience_level?: string;
  work_type?: string;
}

export interface VagaTrabalho {
  id: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  tipo: string;
  nivel_experiencia: string;
  modalidade_trabalho: string;
  data_publicacao: string;
  descricao: string;
  url_vaga: string;
  salario?: string;
}

// Tipos para estatísticas
export interface EstatisticasUsuario {
  total_posts: number;
  total_comentarios: number;
  total_curtidas: number;
  nivel_atual: number;
  ranking_comunidade?: number;
}

export interface EstatisticasSistema {
  total_usuarios: number;
  total_posts: number;
  total_cursos: number;
  usuarios_ativos: number;
}

// Em types/index.ts - ADICIONE ESTES TIPOS
export interface ConversaAPI {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  data_criacao: string;
  ultima_mensagem?: string;
  created_at: string;
}

export interface MensagemAPI {
  id: number;
  conversa_id: number;
  remetente_id: number;
  mensagem: string;
  data_envio: string;
  lida: boolean;
  created_at: string;
}

export interface ConversaCompletaAPI {
  conversa: ConversaAPI;
  mensagens: MensagemAPI[];
}

export interface NaoLidasResponse {
  nao_lidas: number;
}