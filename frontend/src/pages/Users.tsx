// frontend/src/pages/Users.tsx
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Grid as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useUsersData, useUsersLocations, useCreateConversation } from '../services/hooks';
import type { Usuario } from '../types';

const Users: React.FC = () => {
  const [filters, setFilters] = useState({
    estado: '',
    cidade: '',
    limit: 20,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: usersData, isLoading, error } = useUsersData(filters);
  const { data: locationsData, isLoading: locationsLoading } = useUsersLocations();
  const { user: currentUser } = useAuth();
  const createConversationMutation = useCreateConversation();
  
  const users: Usuario[] = Array.isArray(usersData) ? usersData : usersData?.usuarios || [];
  const total = Array.isArray(usersData) ? users.length : usersData?.total || 0;
  const currentOffset = filters.offset;

  const estadosDisponiveis = locationsData?.estados || [];
  const cidadesDisponiveis = locationsData?.cidadesPorEstado?.[filters.estado] || [];

  const hasNextPage = (currentOffset + users.length) < total;
  
  const filteredUsers = useMemo(() => {
    return users.filter((user: Usuario) => {
      const matchesSearch = 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.titulo_equipado_id && searchTerm.toLowerCase().includes('título'));
      
      const matchesEstado = !filters.estado || user.estado === filters.estado;
      const matchesCidade = !filters.cidade || user.cidade === filters.cidade;
      
      return matchesSearch && matchesEstado && matchesCidade;
    });
  }, [users, searchTerm, filters.estado, filters.cidade]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value,
        offset: 0
      };
      
      if (field === 'estado') {
        newFilters.cidade = '';
      }
      
      return newFilters;
    });
  };

  // ✅ FUNÇÃO PARA CRIAR CONVERSA E REDIRECIONAR
  const handleStartConversation = async (user: Usuario) => {
    if (!user || !currentUser || currentUser.id === user.id) return;

    try {
      // ✅ CRIA A CONVERSA COM O USUÁRIO
      await createConversationMutation.mutateAsync(user.id);
      
      // ✅ REDIRECIONA PARA /chat
      navigate('/chat');
      
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      // Mesmo em caso de erro, redireciona para o chat
      navigate('/chat');
    }
  };

  const getProfileLink = (userId: number) => {
    if (currentUser && currentUser.id === userId) {
      return "/meu-perfil";
    } else {
      return `/perfil/${userId}`;
    }
  };

  const isCurrentUser = (userId: number): boolean => {
    return Boolean(currentUser && currentUser.id === userId);
  };

  // Função para obter a cor do nível baseado no nível atual
  const getLevelColor = (nivel: number) => {
    if (nivel >= 20) return 'error';
    if (nivel >= 15) return 'warning';
    if (nivel >= 10) return 'info';
    if (nivel >= 5) return 'secondary';
    return 'primary';
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Erro ao carregar usuários: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Comunidade de Usuários
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Conheça outros membros da comunidade e faça novas conexões
      </Typography>

      {/* Filtros e Busca */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, bio ou títulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                label="Estado"
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                disabled={locationsLoading}
              >
                <MenuItem value="">Todos os estados</MenuItem>
                {estadosDisponiveis.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
                {estadosDisponiveis.length === 0 && !locationsLoading && (
                  <MenuItem disabled>Nenhum estado encontrado</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Cidade</InputLabel>
              <Select
                value={filters.cidade}
                label="Cidade"
                onChange={(e) => handleFilterChange('cidade', e.target.value)}
                disabled={!filters.estado || locationsLoading || cidadesDisponiveis.length === 0}
              >
                <MenuItem value="">Todas as cidades</MenuItem>
                {cidadesDisponiveis.map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
                {filters.estado && cidadesDisponiveis.length === 0 && !locationsLoading && (
                  <MenuItem disabled>Nenhuma cidade encontrada</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Estatísticas */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip 
          label={`${filteredUsers.length} usuário${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
          color="primary"
          variant="filled"
        />
        {filters.estado && (
          <Chip 
            label={`Estado: ${filters.estado}`}
            onDelete={() => handleFilterChange('estado', '')}
            variant="outlined"
          />
        )}
        {filters.cidade && (
          <Chip 
            label={`Cidade: ${filters.cidade}`}
            onDelete={() => handleFilterChange('cidade', '')}
            variant="outlined"
          />
        )}
        {searchTerm && (
          <Chip 
            label={`Busca: "${searchTerm}"`}
            onDelete={() => setSearchTerm('')}
            variant="outlined"
          />
        )}
      </Box>

      {/* Lista de Usuários */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user: Usuario) => {
            const isOwnProfile = isCurrentUser(user.id);
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    {/* Avatar e Nome */}
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '1.8rem',
                        border: isOwnProfile ? 3 : 0,
                        borderColor: 'primary.main'
                      }}
                    >
                      {user.nome.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {user.nome}
                      {isOwnProfile && (
                        <Chip 
                          label="Você" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>

                    {/* Título Equipado */}
                    {user.titulo_equipado_id && (
                      <Tooltip title="Título equipado" arrow>
                        <Chip 
                          label={`🏆 ${user.titulo_equipado_id}`}
                          color="success"
                          variant="filled"
                          size="small"
                          sx={{ 
                            mb: 2,
                            fontWeight: 'bold',
                            maxWidth: '100%'
                          }}
                        />
                      </Tooltip>
                    )}

                    {/* Bio */}
                    {user.bio && (
                      <Typography 
                        variant="body2" 
                        paragraph 
                        sx={{ 
                          fontStyle: 'italic',
                          color: 'text.secondary',
                          minHeight: 40,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        "{user.bio}"
                      </Typography>
                    )}

                    {/* Nível e XP */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title={`Nível ${user.nivel_atual}`} arrow>
                        <Chip 
                          icon={<span>⭐</span>}
                          label={`Nv. ${user.nivel_atual}`} 
                          size="small" 
                          color={getLevelColor(user.nivel_atual)}
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title={`${user.xp_atual.toLocaleString()} pontos de experiência`} arrow>
                        <Chip 
                          icon={<span>⚡</span>}
                          label={`${user.xp_atual.toLocaleString()} XP`} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </Tooltip>
                    </Box>

                    {/* Localização */}
                    {user.estado && user.cidade && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        📍 {user.cidade}, {user.estado}
                      </Typography>
                    )}

                    {/* Grupos de Vulnerabilidade */}
                    {user.grupos_vulnerabilidade.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                          Grupos de vulnerabilidade:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                          {user.grupos_vulnerabilidade.slice(0, 3).map((grupo) => (
                            <Tooltip key={grupo.id} title={`${grupo.categoria} - ${grupo.tipo}`} arrow>
                              <Chip
                                label={grupo.tipo}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem' }}
                              />
                            </Tooltip>
                          ))}
                          {user.grupos_vulnerabilidade.length > 3 && (
                            <Tooltip title={`Mais ${user.grupos_vulnerabilidade.length - 3} grupos`} arrow>
                              <Chip
                                label={`+${user.grupos_vulnerabilidade.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  
                  {/* Ações */}
                  <CardActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      component={Link}
                      to={getProfileLink(user.id)}
                      sx={{ flex: 1 }}
                    >
                      {isOwnProfile ? 'Meu Perfil' : 'Ver Perfil'}
                    </Button>
                    
                    {/* ✅ BOTÃO CORRIGIDO - CRIA CONVERSA AUTOMATICAMENTE */}
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => handleStartConversation(user)}
                      disabled={isOwnProfile || createConversationMutation.isPending}
                      sx={{ flex: 1 }}
                    >
                      {createConversationMutation.isPending ? (
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                      ) : isOwnProfile ? (
                        'Você'
                      ) : (
                        'Mensagem'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Mensagem quando não há usuários */}
      {!isLoading && filteredUsers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            {searchTerm || filters.estado || filters.cidade
              ? 'Nenhum usuário encontrado' 
              : 'A comunidade está crescendo...'
            }
          </Typography>
          <Typography color="textSecondary">
            {searchTerm || filters.estado || filters.cidade
              ? 'Tente ajustar os filtros de busca' 
              : 'Seja um dos primeiros a fazer parte desta comunidade!'
            }
          </Typography>
        </Box>
      )}

      {/* Paginação */}
      {!isLoading && filteredUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            disabled={filters.offset === 0}
            onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
            startIcon={<span>←</span>}
          >
            Anterior
          </Button>
          
          <Typography variant="body2" color="textSecondary">
            Página {Math.floor(filters.offset / filters.limit) + 1} • 
            Mostrando {users.length} de {total} usuários
          </Typography>

          <Button
            disabled={!hasNextPage || isLoading}
            variant="outlined"
            onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            endIcon={<span>→</span>}
          >
            Próxima
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Users;