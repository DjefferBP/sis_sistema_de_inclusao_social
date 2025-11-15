import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  CircularProgress,
  Fab,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Add, TrendingUp, FilterList } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { usePosts, useCreatePost, useLikePost, useUnlikePost, useCurrentUser } from '../services/hooks';

const Forum: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ titulo: '', conteudo: '', categoria: '' });
  const [errors, setErrors] = useState<{ titulo?: string; conteudo?: string }>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const theme = useTheme();
  
  const { data: postsData, isLoading, refetch } = usePosts();
  const { data: currentUser } = useCurrentUser();
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const posts = postsData?.posts || [];

  // Extrai categorias únicas dos posts
  const categories = useMemo(() => {
    const cats = posts
      .map(post => post.categoria)
      .filter(Boolean)
      .filter((cat, index, arr) => arr.indexOf(cat) === index)
      .sort();
    return cats;
  }, [posts]);

  // Filtra posts por categoria
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(post => post.categoria === selectedCategory);
  }, [posts, selectedCategory]);

  // Função de validação
  const validateForm = () => {
    const newErrors: { titulo?: string; conteudo?: string } = {};

    if (newPost.titulo.length < 5) {
      newErrors.titulo = 'O título deve ter pelo menos 5 caracteres';
    }

    if (newPost.conteudo.length < 10) {
      newErrors.conteudo = 'O conteúdo deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Por favor, corrija os erros no formulário',
        severity: 'error'
      });
      return;
    }

    try {
      await createPost.mutateAsync(newPost);
      setNewPost({ titulo: '', conteudo: '', categoria: '' });
      setShowCreateForm(false);
      setErrors({});
      
      setSnackbar({
        open: true,
        message: 'Post criado com sucesso!',
        severity: 'success'
      });
      
      refetch();
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao criar post. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Você precisa estar logado para curtir posts!',
        severity: 'error'
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.curtido) {
        await unlikePost.mutateAsync(postId);
      } else {
        await likePost.mutateAsync(postId);
      }
      
      setTimeout(() => refetch(), 300);
    } catch (error: any) {
      console.error('Erro ao atualizar curtida:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao curtir post. Tente novamente.',
        severity: 'error'
      });
      refetch();
    }
  };

  const toggleExpandPost = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const isPostLong = (content: string) => content.length > 200;

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Contadores de caracteres
  const tituloCount = newPost.titulo.length;
  const conteudoCount = newPost.conteudo.length;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Fórum da Comunidade
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Compartilhe ideias, faça perguntas e conecte-se
            </Typography>
          </Box>
          
          {currentUser && (
            <Fab
              variant="extended"
              color="primary"
              onClick={() => setShowCreateForm(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                minWidth: 'auto'
              }}
            >
              <Add sx={{ mr: 1 }} />
              Novo Post
            </Fab>
          )}
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)` }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterList color="primary" />
            <Typography variant="h6" color="text.primary">
              Filtrar por:
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoria"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">Todas as categorias</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Chips de filtro ativo */}
            {selectedCategory !== 'all' && (
              <Chip
                label={`Categoria: ${selectedCategory}`}
                onDelete={() => setSelectedCategory('all')}
                color="primary"
                variant="outlined"
              />
            )}

            {/* Contador de posts */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'all' && ` em ${selectedCategory}`}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Formulário de criação */}
      {showCreateForm && (
        <Card sx={{ mb: 4, border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add color="primary" />
              Criar Novo Post
            </Typography>
            
            <Box component="form" onSubmit={handleCreatePost}>
              <TextField
                fullWidth
                label="Título do post"
                value={newPost.titulo}
                onChange={(e) => {
                  setNewPost({ ...newPost, titulo: e.target.value });
                  if (errors.titulo) setErrors({ ...errors, titulo: undefined });
                }}
                margin="normal"
                required
                error={!!errors.titulo}
                helperText={errors.titulo}
                inputProps={{ maxLength: 200 }}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Conteúdo"
                value={newPost.conteudo}
                onChange={(e) => {
                  setNewPost({ ...newPost, conteudo: e.target.value });
                  if (errors.conteudo) setErrors({ ...errors, conteudo: undefined });
                }}
                margin="normal"
                multiline
                rows={6}
                required
                error={!!errors.conteudo}
                helperText={errors.conteudo}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Categoria (opcional)"
                value={newPost.categoria}
                onChange={(e) => setNewPost({ ...newPost, categoria: e.target.value })}
                margin="normal"
                variant="outlined"
                helperText="Ex: Dúvida, Dica, Discussão, etc."
              />
              
              <CardActions sx={{ px: 0, pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={createPost.isPending || tituloCount < 5 || conteudoCount < 10}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  {createPost.isPending ? <CircularProgress size={24} /> : 'Publicar Post'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPost({ titulo: '', conteudo: '', categoria: '' });
                    setErrors({});
                  }}
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  Cancelar
                </Button>
                
                {/* Indicadores de progresso */}
                <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                  <Chip
                    label={`Título ${tituloCount}/5`}
                    size="small"
                    color={tituloCount >= 5 ? 'success' : 'default'}
                    variant={tituloCount >= 5 ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label={`Conteúdo ${conteudoCount}/10`}
                    size="small"
                    color={conteudoCount >= 10 ? 'success' : 'default'}
                    variant={conteudoCount >= 10 ? 'filled' : 'outlined'}
                  />
                </Box>
              </CardActions>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Lista de Posts */}
      <Box sx={{ mb: 4 }}>
        {filteredPosts.map((post) => {
          const isLiked = post.curtido || false;
          const isLikeLoading = likePost.isPending || unlikePost.isPending;
          const isExpanded = expandedPosts.has(post.id);
          const shouldTruncate = isPostLong(post.conteudo) && !isExpanded;
          const engagementScore = post.curtidas_count + post.comentarios_count;
          
          return (
            <Card 
              key={post.id} 
              sx={{ 
                mb: 3, 
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Cabeçalho */}
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
                    {engagementScore > 10 && (
                      <Chip 
                        icon={<TrendingUp />}
                        label="Popular"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
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

                {/* Título */}
                <Typography 
                  variant="h5" 
                  component={Link} 
                  to={`/post/${post.id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    '&:hover': { color: 'primary.main' },
                    fontWeight: 700,
                    display: 'block',
                    mb: 2,
                    lineHeight: 1.3
                  }}
                >
                  {post.titulo}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Conteúdo */}
                <Typography 
                  paragraph 
                  sx={{ 
                    mb: 3, 
                    lineHeight: 1.7,
                    color: 'text.primary',
                    fontSize: '1.1rem'
                  }}
                >
                  {shouldTruncate ? `${post.conteudo.substring(0, 200)}...` : post.conteudo}
                  
                  {isPostLong(post.conteudo) && (
                    <Button
                      size="small"
                      onClick={() => toggleExpandPost(post.id)}
                      sx={{ ml: 1, minWidth: 'auto', fontWeight: 600 }}
                    >
                      {isExpanded ? 'Ver menos' : 'Continuar lendo'}
                    </Button>
                  )}
                </Typography>

                {/* Interações */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="medium"
                        onClick={() => handleLike(post.id)}
                        disabled={!currentUser || isLikeLoading}
                        sx={{
                          color: isLiked ? '#ff61b5' : 'default',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                          }
                        }}
                      >
                        {isLikeLoading ? (
                          <CircularProgress size={20} />
                        ) : isLiked ? (
                          <Favorite />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          minWidth: '20px',
                          fontWeight: 600,
                          color: isLiked ? '#ff61b5': 'text.primary'
                        }}
                      >
                        {post.curtidas_count}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment color="action" />
                      <Typography variant="body1" fontWeight={600} color="text.secondary">
                        {post.comentarios_count}
                      </Typography>
                    </Box>
                  </Box>

                  <Button 
                    component={Link} 
                    to={`/post/${post.id}`}
                    variant="outlined"
                    size="large"
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Comentários
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Estado vazio */}
      {filteredPosts.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h4" color="text.secondary" gutterBottom>
              {selectedCategory !== 'all' ? 'Nenhum post nesta categoria' : 'Nenhum post encontrado'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {currentUser 
                ? 'Seja o primeiro a compartilhar algo com a comunidade!' 
                : 'Faça login para ver e criar posts na comunidade!'
              }
            </Typography>
            {currentUser ? (
              <Button 
                variant="contained" 
                size="large"
                onClick={() => setShowCreateForm(true)}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Criar Primeiro Post
              </Button>
            ) : (
              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Fazer Login
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão flutuante para mobile */}
      {currentUser && !showCreateForm && (
        <Fab
          color="primary"
          onClick={() => setShowCreateForm(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' }
          }}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Forum;