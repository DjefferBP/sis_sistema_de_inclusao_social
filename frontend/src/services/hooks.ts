import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  userService, postService, commentService, courseService, 
  chatService, xpService, jobService, statsService 
} from './api';
import type { 
  UserUpdate, PostCreate, CommentCreate, MensagemCreate,
  PostFilters, CourseFilters, UserFilters, TrabalhoFiltros 
} from '../types';

// Hooks para Usuários
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
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
    staleTime: 5 * 60 * 1000, // 5 minutos
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

// Hooks para Posts
export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postService.getPosts(filters),
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

export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postService.likePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postService.unlikePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Hooks para Comentários
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
    onSuccess: (data, variables) => {
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

// Hooks para Sistema de XP
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
    staleTime: 30 * 60 * 1000, // 30 minutos
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

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: number; message: string }) => 
      chatService.sendMessage(conversationId, { conversa_id: conversationId, mensagem: message }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
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