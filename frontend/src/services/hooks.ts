import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userService, postService, commentService, courseService,
  chatService, xpService, jobService, statsService,
  authService
} from './api';
import type {
  PostFilters, CourseFilters, UserFilters, TrabalhoFiltros
} from '../types';

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });
};


export const useUsersData = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });
};

export const useUsersLocations = () => {
  return useQuery({
    queryKey: ['usersLocations'],
    queryFn: async () => {
      const usersData = await userService.getUsers({ limit: 1000 });
      const users = Array.isArray(usersData) ? usersData : usersData?.usuarios || [];

      // Extrai estados e cidades únicos
      const estados = Array.from(new Set(
        users
          .filter(user => user.estado)
          .map(user => user.estado)
          .sort()
      ));

      const cidadesPorEstado: Record<string, string[]> = {};
      users.forEach(user => {
        if (user.estado && user.cidade) {
          if (!cidadesPorEstado[user.estado]) {
            cidadesPorEstado[user.estado] = [];
          }
          if (!cidadesPorEstado[user.estado].includes(user.cidade)) {
            cidadesPorEstado[user.estado].push(user.cidade);
          }
        }
      });

      Object.keys(cidadesPorEstado).forEach(estado => {
        cidadesPorEstado[estado].sort();
      });

      return {
        estados,
        cidadesPorEstado
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useGruposVulnerabilidade = () => {
  return useQuery({
    queryKey: ['gruposVulnerabilidade'],
    queryFn: () => userService.getGruposVulnerabilidade(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postService.getPosts(filters),
    staleTime: 0,
  });
};

export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useComments = (postId: number) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getCommentsByPost(postId),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.post_id] });
    },
  });
};

// Hooks para Cursos
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseService.getCourses(filters),
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
  });
};

export const useCourseAreas = () => {
  return useQuery({
    queryKey: ['courseAreas'],
    queryFn: () => courseService.getAvailableAreas(),
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: () => xpService.getUserProgress(),
  });
};

export const useXPHistory = () => {
  return useQuery({
    queryKey: ['xpHistory'],
    queryFn: () => xpService.getXPHistory(),
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: () => xpService.getLevels(),
    staleTime: 30 * 60 * 1000,
  });
};

// Hooks para Chat
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations(),
  });
};

export const useMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
  });
};

// services/hooks.ts - HOOK CORRIGIDO
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: number; message: string }) =>
      chatService.sendMessage(conversationId, message), // ✅ Agora está correto
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// services/hooks.ts - NOVO HOOK (usando rota real)
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuario2_id: number) => 
      chatService.createConversation(usuario2_id), // ✅ Usa a rota POST real
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// services/hooks.ts - NOVO HOOK (usando rota real)
export const useFindConversation = (usuario2_id: number) => {
  return useQuery({
    queryKey: ['conversationWithUser', usuario2_id],
    queryFn: () => chatService.findConversation(usuario2_id), // ✅ Usa a rota GET real
    enabled: !!usuario2_id,
  });
};


// Hooks para Trabalhos
export const useJobSearch = (filters: TrabalhoFiltros) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.searchJobs(filters),
    enabled: !!filters.field || !!filters.location,
  });
};

// Hooks para Estatísticas
export const useUserStats = (userId?: number) => {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => statsService.getUserStats(userId),
    enabled: userId !== undefined,
  });
};

// ... (mantenha todos os hooks existentes que estavam funcionando)

// Hooks para comentários - VERSÃO CORRIGIDA (sem avisos)
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.likePost,
    onSuccess: (data, postId) => {
      // Atualiza tanto a lista de posts quanto o post individual
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });

      // Também atualiza o cache do post específico
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          curtido: true,
          curtidas_count: data.curtidas_count
        };
      });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.unlikePost,
    onSuccess: (data, postId) => {
      // Atualiza tanto a lista de posts quanto o post individual
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });

      // Também atualiza o cache do post específico
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          curtido: false,
          curtidas_count: data.curtidas_count
        };
      });
    },
  });
};

// Hooks para comentários - VERSÃO CORRIGIDA (sem avisos)
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.likeComment,
    onSuccess: () => {
      // Invalida todas as queries de comentários para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.unlikeComment,
    onSuccess: () => {
      // Invalida todas as queries de comentários para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useCommentLikeStatus = (commentId: number) => {
  return useQuery({
    queryKey: ['commentLikeStatus', commentId],
    queryFn: async () => {
      // Como a API não tem um endpoint para verificar like de comentário,
      // vamos fazer uma verificação baseada na resposta de erro
      try {
        // Tentamos curtir - se der erro "já curtiu", significa que está curtido
        await commentService.likeComment(commentId);
        // Se não deu erro, não estava curtido
        return false;
      } catch (error: any) {
        if (error.message.includes('já curtiu')) {
          return true;
        }
        throw error;
      }
    },
    enabled: false, // Não executa automaticamente
    retry: false,
  });
};

// Adicione no seu hooks.ts
export const useNextLevel = () => {
  return useQuery({
    queryKey: ['nextLevel'],
    queryFn: () => xpService.getNextLevelInfo(),
  });
};

export const useEquipTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tituloId: number) => xpService.equipTitle(tituloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useRemoveEquippedTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => xpService.removeEquippedTitle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// Hook para verificar like do post (se necessário)

// Hook para autenticação (se necessário)
export const useAuth = () => {
  return useMutation({
    mutationFn: authService.login, // ou o método de autenticação que você preferir
  });
};

function fetchAPI(arg0: string, arg1: {}, arg2: boolean) {
  throw new Error('Function not implemented.');
}
