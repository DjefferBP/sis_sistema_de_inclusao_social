import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment as CommentIcon, Send, ArrowBack } from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  usePost, 
  useComments, 
  useCreateComment, 
  useLikePost, 
  useUnlikePost, 
  useCurrentUser,
  useLikeComment,
  useUnlikeComment 
} from '../services/hooks';

// Tipo para o snackbar
type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = parseInt(id || '0');
  const theme = useTheme();
  
  const [newComment, setNewComment] = useState('');
  const [localPostLiked, setLocalPostLiked] = useState<boolean | null>(null);
  const [commentLikes, setCommentLikes] = useState<{[key: number]: boolean}>({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' as SnackbarSeverity 
  });
  
  const { data: post, isLoading: postLoading, refetch: refetchPost } = usePost(postId);
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments(postId);
  const { data: currentUser } = useCurrentUser();
  
  const createComment = useCreateComment();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();

  // Sincroniza o estado local com os dados da API
  useEffect(() => {
    if (post) {
      setLocalPostLiked(post.curtido || false);
    }
  }, [post]);

  // Inicializa o estado de likes dos comentários baseado na contagem
  useEffect(() => {
    if (commentsData && currentUser) {
      const initialLikes: {[key: number]: boolean} = {};
      
      const comments = getCommentsFromData();
      comments.forEach((comment: any) => {
        initialLikes[comment.id] = comment.curtidas_count > 0;
      });
      
      setCommentLikes(initialLikes);
    }
  }, [commentsData, currentUser]);

  // Função para obter os comentários da estrutura de dados
  const getCommentsFromData = () => {
    if (!commentsData) return [];

    if (Array.isArray(commentsData)) {
      return commentsData;
    }

    if (commentsData.items && Array.isArray(commentsData.items)) {
      return commentsData.items;
    }

    if (commentsData.comentarios && Array.isArray(commentsData.comentarios)) {
      return commentsData.comentarios;
    }

    if (commentsData.data && Array.isArray(commentsData.data)) {
      return commentsData.data;
    }

    const arrayProperties = Object.keys(commentsData).filter(key => 
      Array.isArray(commentsData[key])
    );

    if (arrayProperties.length > 0) {
      return commentsData[arrayProperties[0]];
    }

    return [];
  };

  const comments = getCommentsFromData();

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        post_id: postId,
        conteudo: newComment,
      });
      
      setNewComment('');
      showSnackbar('Comentário adicionado com sucesso!', 'success');
      setTimeout(() => {
        refetchComments();
        refetchPost();
      }, 500);

    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      showSnackbar('Erro ao adicionar comentário', 'error');
    }
  };

  const handleLikePost = async () => {
    if (!currentUser) {
      showSnackbar('Você precisa estar logado para curtir posts!', 'error');
      return;
    }

    try {
      const wasLiked = localPostLiked;
      setLocalPostLiked(!wasLiked);

      if (wasLiked) {
        await unlikePost.mutateAsync(postId);
        showSnackbar('Post descurtido', 'success');
      } else {
        await likePost.mutateAsync(postId);
        showSnackbar('Post curtido', 'success');
      }
      
      setTimeout(() => {
        refetchPost();
      }, 300);
    } catch (error) {
      console.error('Erro ao atualizar curtida:', error);
      setLocalPostLiked(!localPostLiked);
      showSnackbar('Erro ao curtir post', 'error');
      refetchPost();
    }
  };

  const handleLikeComment = async (commentId: number, isCurrentlyLiked: boolean) => {
    if (!currentUser) {
      showSnackbar('Você precisa estar logado para curtir comentários!', 'error');
      return;
    }

    try {
      // Atualização otimista - muda o estado local imediatamente
      const newLikeState = !isCurrentlyLiked;
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: newLikeState
      }));

      if (isCurrentlyLiked) {
        await unlikeComment.mutateAsync(commentId);
        showSnackbar('Comentário descurtido', 'success');
      } else {
        await likeComment.mutateAsync(commentId);
        showSnackbar('Comentário curtido', 'success');
      }
      
      // Recarrega os comentários para garantir sincronização
      setTimeout(() => {
        refetchComments();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao atualizar curtida do comentário:', error);
      
      // Reverte a atualização otimista em caso de erro
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: isCurrentlyLiked
      }));
      
      if (error.message.includes('já curtiu')) {
        showSnackbar('Você já curtiu este comentário', 'error');
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: true
        }));
      } else if (error.message.includes('não curtiu')) {
        showSnackbar('Você não curtiu este comentário', 'error');
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: false
        }));
      } else {
        showSnackbar('Erro ao curtir comentário', 'error');
      }
      
      setTimeout(() => {
        refetchComments();
      }, 300);
    }
  };

  if (postLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h4" color="text.secondary" gutterBottom>
              Post não encontrado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              O post que você está procurando não existe ou foi removido.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/forum')}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Voltar para o Fórum
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isPostLiked = localPostLiked !== null ? localPostLiked : (post.curtido || false);
  const isPostLikeLoading = likePost.isPending || unlikePost.isPending;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Botão Voltar */}
      <Button 
        variant="outlined" 
        onClick={() => navigate('/forum')}
        startIcon={<ArrowBack />}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Voltar para o Fórum
      </Button>

      {/* Post Principal */}
      <Card sx={{ mb: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <CardContent sx={{ p: 4 }}>
          {/* Cabeçalho do Post */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <IconButton 
                component={Link} 
                to={`/perfil/${post.usuario_id}`}
                size="small"
              >
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '1.2rem'
                  }}
                >
                  {post.autor_nome?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  component={Link}
                  to={`/perfil/${post.usuario_id}`}
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {post.autor_nome}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {post.categoria && (
                <Chip 
                  label={post.categoria} 
                  size="small" 
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>

          {/* Título do Post */}
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2, mb: 3 }}>
            {post.titulo}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Conteúdo do Post */}
          <Typography 
            sx={{ 
              lineHeight: 1.8,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line',
              color: 'text.primary'
            }}
          >
            {post.conteudo}
          </Typography>
        </CardContent>

        {/* Interações do Post */}
        <CardActions sx={{ 
          px: 4, 
          py: 3, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.default, 0.6)
        }}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="medium"
                onClick={handleLikePost}
                disabled={!currentUser || isPostLikeLoading}
                sx={{
                  color: isPostLiked ? '#ff61b5' : 'default',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 97, 181, 0.1)',
                  }
                }}
              >
                {isPostLikeLoading ? (
                  <CircularProgress size={20} />
                ) : isPostLiked ? (
                  <Favorite />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{ 
                  minWidth: '30px',
                  fontWeight: 600,
                  color: isPostLiked ? '#ff61b5' : 'text.primary'
                }}
              >
                {post.curtidas_count}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CommentIcon color="action" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                {post.comentarios_count}
              </Typography>
            </Box>
          </Box>
        </CardActions>
      </Card>

      {/* Seção de Comentários */}
      <Card sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Comentários ({comments.length})
          </Typography>

          {/* Formulário de Novo Comentário */}
          {currentUser && (
            <Card sx={{ mb: 4, border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommentIcon color="primary" />
                  Adicionar Comentário
                </Typography>
                <Box component="form" onSubmit={handleCreateComment}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Compartilhe seus pensamentos..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    variant="outlined"
                    required
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<Send />}
                      disabled={createComment.isPending || !newComment.trim()}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      {createComment.isPending ? <CircularProgress size={24} /> : 'Publicar Comentário'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {!currentUser && (
            <Card sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="body1" color="text.secondary" align="center">
                <Link 
                  to="/login" 
                  style={{ 
                    color: theme.palette.primary.main, 
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Faça login
                </Link> para participar da discussão
              </Typography>
            </Card>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Lista de Comentários */}
          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : comments.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {comments.map((comment: any) => {
                const isCommentLiked = commentLikes[comment.id] !== undefined 
                  ? commentLikes[comment.id] 
                  : (comment.curtido || comment.curtidas_count > 0);
                
                const isCommentLikeLoading = likeComment.isPending || unlikeComment.isPending;
                
                return (
                  <Card 
                    key={comment.id} 
                    sx={{ 
                      mb: 2, 
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <IconButton 
                          component={Link} 
                          to={`/perfil/${comment.usuario_id}`}
                          size="small"
                        >
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: theme.palette.secondary.main
                            }}
                          >
                            {comment.autor_nome?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                        </IconButton>
                        
                        <Box sx={{ flex: 1, }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography 
                                component={Link}
                                to={`/perfil/${comment.usuario_id}`}
                                variant="subtitle1" 
                                sx={{ 
                                  paddingRight: 1,
                                  fontWeight: 600, 
                                  textDecoration: 'none',
                                  color: 'text.primary',
                                  '&:hover': { color: 'primary.main' }
                                }}
                              >
                                {comment.autor_nome || 'Usuário'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                            
                            {/* Like do Comentário */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleLikeComment(comment.id, isCommentLiked)}
                                disabled={!currentUser || isCommentLikeLoading}
                                sx={{
                                  color: isCommentLiked ? '#ff61b5' : 'default',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 97, 181, 0.1)',
                                  }
                                }}
                              >
                                {isCommentLikeLoading ? (
                                  <CircularProgress size={16} />
                                ) : isCommentLiked ? (
                                  <Favorite fontSize="small" />
                                ) : (
                                  <FavoriteBorder fontSize="small" />
                                )}
                              </IconButton>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  minWidth: '20px',
                                  fontWeight: 600,
                                  color: isCommentLiked ? '#ff61b5' : 'text.secondary'
                                }}
                              >
                                {comment.curtidas_count || 0}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              whiteSpace: 'pre-line',
                              lineHeight: 1.6,
                              color: 'text.primary'
                            }}
                          >
                            {comment.conteudo}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum comentário ainda
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Seja o primeiro a compartilhar sua opinião!
                </Typography>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Botão flutuante para voltar ao topo */}
      <Fab
        color="primary"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        ↑
      </Fab>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PostDetail;