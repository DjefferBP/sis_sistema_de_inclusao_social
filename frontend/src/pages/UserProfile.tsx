import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid as Grid,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUser, useLevels, useNextLevel, useCreateConversation } from '../services/hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  Message,
  Edit,
  LocationOn,
  Person,
  Description,
  Groups,
  MilitaryTech,
  EmojiEvents,
  TrendingUp,
  AutoAwesome,
} from '@mui/icons-material';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading, error } = useUser(Number(id));
  const { data: levels } = useLevels();
  const { data: nextLevelInfo } = useNextLevel();
  const theme = useTheme();
  const navigate = useNavigate();

const getTitleColor = (nivel: number) => {
  const colors = [
    '#4CAF50', // Verde - Nível 1-4
    '#2196F3', // Azul - Nível 5-9
    '#9C27B0', // Roxo - Nível 10-14
    '#FF9800', // Laranja - Nível 15-19
    '#F44336', // Vermelho - Nível 20+
  ];
  return colors[Math.min(Math.floor(nivel / 5), 4)];
};

  const createConversationMutation = useCreateConversation();

  const handleStartConversation = async () => {
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

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error ? `Erro ao carregar perfil: ${error.message}` : 'Usuário não encontrado'}
        </Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  // Encontrar nível atual e próximo nível baseado nos dados reais
  const currentLevel = levels?.find(level => level.nivel === user.nivel_atual);
  const nextLevel = levels?.find(level => level.nivel === user.nivel_atual + 1);
  
  // Calcular progresso real baseado nos níveis da API
  const xpCurrentLevel = currentLevel?.xp_necessario || 0;
  const xpNextLevel = nextLevel?.xp_necessario || user.xp_atual;
  const xpForNextLevel = xpNextLevel - xpCurrentLevel;
  const xpProgress = user.xp_atual - xpCurrentLevel;
  const progressPercentage = nextLevel ? Math.min((xpProgress / xpForNextLevel) * 100, 100) : 100;

  // Encontrar título equipado
  const equippedTitle = levels?.find(title => title.id === user.titulo_equipado_id);

  const getNivelColor = (nivel: number) => {
    if (nivel >= 20) return '#FFD700'; // Ouro
    if (nivel >= 15) return '#C0C0C0'; // Prata
    if (nivel >= 10) return '#CD7F32'; // Bronze
    if (nivel >= 5) return theme.palette.secondary.main;
    return theme.palette.primary.main;
  };

  const getLevelName = (nivel: number) => {
    if (nivel >= 20) return 'Lendário';
    if (nivel >= 15) return 'Mestre';
    if (nivel >= 10) return 'Avançado';
    if (nivel >= 5) return 'Intermediário';
    return 'Iniciante';
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header do Perfil */}
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Elemento decorativo */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              zIndex: 0,
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  border: `4px solid ${getNivelColor(user.nivel_atual)}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  {user.nome}
                </Typography>
                
                {/* Título Equipado */}
                {equippedTitle && (
                  <Tooltip title={`${equippedTitle.descricao || 'Título equipado'}`} arrow>
                    <Chip
                      icon={<AutoAwesome sx={{ color: '#FFD700' }} />}
                      label={equippedTitle.titulo}
                      color="success"
                      variant="filled"
                      sx={{ 
                        mb: 1,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        background: `linear-gradient(135deg, #4CAF50 0%, #45a049 100%)`,
                      }}
                    />
                  </Tooltip>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Tooltip title={`${getLevelName(user.nivel_atual)} - Nível ${user.nivel_atual}`} arrow>
                    <Chip
                      icon={<MilitaryTech sx={{ color: getNivelColor(user.nivel_atual) }} />}
                      label={`Nível ${user.nivel_atual} • ${getLevelName(user.nivel_atual)}`}
                      sx={{ 
                        bgcolor: alpha(getNivelColor(user.nivel_atual), 0.1),
                        color: 'text.primary',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Pontos de Experiência Total" arrow>
                    <Chip
                      icon={<EmojiEvents />}
                      label={`${user.xp_atual.toLocaleString()} XP`}
                      color="secondary"
                      sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* ✅ CORREÇÃO: Botões separados */}
            {isOwnProfile ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                component={Link}
                to="/meu-perfil"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Editar Perfil
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<Message />}
                onClick={handleStartConversation}
                disabled={createConversationMutation.isPending}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  }
                }}
              >
                {createConversationMutation.isPending ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  'Enviar Mensagem'
                )}
              </Button>
            )}
          </Box>

          {/* Barra de Progresso Real */}
          <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp fontSize="small" />
                Progresso para {nextLevel ? `Nível ${nextLevel.nivel}` : 'Nível Máximo'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {user.xp_atual.toLocaleString()} / {xpNextLevel.toLocaleString()} XP
              </Typography>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                },
              }}
            />

            {/* Informações de Progresso */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {xpCurrentLevel.toLocaleString()} XP (Nv. {user.nivel_atual})
              </Typography>
              
              {nextLevel ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    {progressPercentage.toFixed(1)}% concluído
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Faltam {(xpNextLevel - user.xp_atual).toLocaleString()} XP
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  🎉 Nível Máximo Alcançado!
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary">
                {xpNextLevel.toLocaleString()} XP {nextLevel ? `(Nv. ${nextLevel.nivel})` : '(Máx.)'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Coluna da Esquerda - Cards Informativos */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Card de Localização */}
            {(user.cep || user.cidade || user.estado) && (
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" />
                    Localização
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {user.cep && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">CEP</Typography>
                        <Typography variant="body1" fontWeight="500">{user.cep}</Typography>
                      </Box>
                    )}
                    {user.cidade && user.estado && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cidade/Estado</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {user.cidade} - {user.estado}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Card de Estatísticas Detalhadas */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents color="primary" />
                  Estatísticas Detalhadas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Nível Atual</Typography>
                    <Chip 
                      label={user.nivel_atual} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Categoria</Typography>
                    <Chip 
                      label={getLevelName(user.nivel_atual)} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(getNivelColor(user.nivel_atual), 0.2),
                        color: getNivelColor(user.nivel_atual),
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total de XP</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {user.xp_atual.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {nextLevel && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">XP para Nv. {nextLevel.nivel}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {(xpNextLevel - user.xp_atual).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Progresso</Typography>
                        <Typography variant="body2" fontWeight="bold" color="secondary">
                          {progressPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </>
                  )}

                  {equippedTitle && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Título Equipado
                      </Typography>
                      <Chip
                        label={equippedTitle.titulo}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Card de Conexão */}
            {!isOwnProfile && (
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conectar com {user.nome.split(' ')[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Entre em contato e inicie uma conversa
                  </Typography>
                  <Button
                    onClick={handleStartConversation}
                    variant="contained"
                    startIcon={<Message />}
                    fullWidth
                    disabled={createConversationMutation.isPending}
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    {createConversationMutation.isPending ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      'Enviar Mensagem'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Coluna da Direita - Conteúdo Principal */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
              {/* Informações Básicas */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Person color="primary" />
                  Informações do Perfil
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Nome Completo</Typography>
                    <Typography variant="body1" fontWeight="500" sx={{ fontSize: '1.1rem' }}>
                      {user.nome}
                    </Typography>
                  </Grid>
                  
                  {user.cep && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">CEP</Typography>
                      <Typography variant="body1" fontWeight="500">{user.cep}</Typography>
                    </Grid>
                  )}
                  
                  {user.cidade && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Cidade</Typography>
                      <Typography variant="body1" fontWeight="500">{user.cidade}</Typography>
                    </Grid>
                  )}
                  
                  {user.estado && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Estado</Typography>
                      <Typography variant="body1" fontWeight="500">{user.estado}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Bio */}
              {user.bio && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Description color="primary" />
                      Sobre {user.nome.split(' ')[0]}
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '1.05rem' }}>
                        {user.bio}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}

              {/* Grupos de Vulnerabilidade */}
              {user.grupos_vulnerabilidade.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Groups color="primary" />
                      Grupos de Vulnerabilidade
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.grupos_vulnerabilidade.map((grupo) => (
                        <Tooltip key={grupo.id} title={`${grupo.categoria} - ${grupo.tipo}`} arrow>
                          <Chip
                            label={`${grupo.categoria} - ${grupo.tipo}`}
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '1rem', py: 1.5, fontWeight: 500 }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              {/* Mensagem de perfil vazio */}
              {!user.bio && user.grupos_vulnerabilidade.length === 0 && (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2
                  }}
                >
                  <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Perfil em construção
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.nome.split(' ')[0]} ainda não adicionou informações adicionais ao perfil.
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfile;