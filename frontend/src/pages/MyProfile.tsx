import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid as Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Snackbar, // ✅ Adicionado para o pop-up de confirmação
} from '@mui/material';
import { 
  TrendingUp, 
  EmojiEvents, 
  CheckCircle, 
  Edit,
  LocationOn,
  Person,
  Description,
  Groups,
  MilitaryTech,
  AutoAwesome,
  Message,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  useUpdateProfile, 
  useGruposVulnerabilidade, 
  useUserProgress, 
  useLevels,
  useEquipTitle,
  useRemoveEquippedTitle,
  useNextLevel,
} from '../services/hooks';

const MyProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { data: grupos } = useGruposVulnerabilidade();
  const { data: userProgress } = useUserProgress();
  const { data: levels } = useLevels();
  const { data: nextLevelInfo } = useNextLevel();
  const equipTitle = useEquipTitle();
  const removeTitle = useRemoveEquippedTitle();
  const theme = useTheme();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    cep: user?.cep || '',
    estado: user?.estado || '',
    cidade: user?.cidade || '',
    bio: user?.bio || '',
  });
  const [gruposSelecionados, setGruposSelecionados] = useState<number[]>(
    user?.grupos_vulnerabilidade.map(g => g.id) || []
  );
  const [loadingCep, setLoadingCep] = useState(false);
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // ✅ Novo estado para o pop-up
  const [snackbarMessage, setSnackbarMessage] = useState(''); // ✅ Mensagem do pop-up

  // Dados de progresso reais
  const xpAtual = userProgress?.xp_atual || user?.xp_atual || 0;
  const nivelAtual = userProgress?.nivel_atual || user?.nivel_atual || 1;
  const equippedTitle = levels?.find(title => title.id === userProgress?.titulo_equipado_id);

  // Calcular progresso real
  const currentLevel = levels?.find(level => level.nivel === nivelAtual);
  const nextLevel = levels?.find(level => level.nivel === nivelAtual + 1);
  const xpCurrentLevel = currentLevel?.xp_necessario || 0;
  const xpNextLevel = nextLevel?.xp_necessario || xpAtual;
  const xpForNextLevel = xpNextLevel - xpCurrentLevel;
  const xpProgress = xpAtual - xpCurrentLevel;
  const progressPercentage = nextLevel ? Math.min((xpProgress / xpForNextLevel) * 100, 100) : 100;

  // ✅ Função para obter cores dos títulos baseadas no nível
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

  const getNivelColor = (nivel: number) => {
    if (nivel >= 20) return '#FFD700';
    if (nivel >= 15) return '#C0C0C0';
    if (nivel >= 10) return '#CD7F32';
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

  const formatarCEP = (cep: string) => {
    const apenasNumeros = cep.replace(/\D/g, '');
    const cepLimitado = apenasNumeros.slice(0, 8);
    if (cepLimitado.length > 5) {
      return `${cepLimitado.slice(0, 5)}-${cepLimitado.slice(5)}`;
    }
    return cepLimitado;
  };

  const buscarEnderecoPorCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          estado: data.uf || '',
          cidade: data.localidade || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          estado: '',
          cidade: ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCEP(formData.cep);
    }
  }, [formData.cep]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        cep: user.cep || '',
        estado: user.estado || '',
        cidade: user.cidade || '',
        bio: user.bio || '',
      });
      setGruposSelecionados(user.grupos_vulnerabilidade.map(g => g.id) || []);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile.mutateAsync({
        ...formData,
        grupos_vulnerabilidade: gruposSelecionados,
      });
      updateUser(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cep') {
      const cepFormatado = formatarCEP(value);
      setFormData(prev => ({ ...prev, [name]: cepFormatado }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEquipTitle = (title: any) => {
    setSelectedTitle(title);
    setTitleDialogOpen(true);
  };

  const confirmEquipTitle = async () => {
    if (selectedTitle) {
      try {
        await equipTitle.mutateAsync(selectedTitle.id);
        setSnackbarMessage(`🎉 Título "${selectedTitle.titulo}" equipado com sucesso!`);
        setSnackbarOpen(true);
        setTitleDialogOpen(false);
        setSelectedTitle(null);
      } catch (error) {
        console.error('Erro ao equipar título:', error);
      }
    }
  };

  const handleRemoveTitle = () => {
    removeTitle.mutate();
  };

  const isTitleEquipped = (titleId: number) => {
    return userProgress?.titulo_equipado_id === titleId;
  };

  const isTitleAvailable = (title: any) => {
    return (userProgress?.nivel_atual || 1) >= title.nivel;
  };

  const exibirCEPFormatado = (cep: string) => {
    if (!cep) return '';
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    }
    return cep;
  };

  if (!user) {
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
            p: { xs: 2, sm: 3, md: 4 }, // ✅ Responsividade no padding
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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

          {/* ✅ CORREÇÃO: Layout responsivo para o header */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // ✅ Coluna no mobile, linha no desktop
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 3 },
            mb: 3, 
            position: 'relative', 
            zIndex: 1 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 2, sm: 3 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  border: `4px solid ${getNivelColor(nivelAtual)}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {user.nome}
                </Typography>
                
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
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        background: `linear-gradient(135deg, #4CAF50 0%, #45a049 100%)`,
                      }}
                    />
                  </Tooltip>
                )}

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 }, 
                  flexWrap: 'wrap',
                  mt: 1 
                }}>
                  <Tooltip title={`${getLevelName(nivelAtual)} - Nível ${nivelAtual}`} arrow>
                    <Chip
                      icon={<MilitaryTech sx={{ color: getNivelColor(nivelAtual) }} />}
                      label={`Nv. ${nivelAtual} • ${getLevelName(nivelAtual)}`}
                      sx={{ 
                        bgcolor: alpha(getNivelColor(nivelAtual), 0.1),
                        color: 'text.primary',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.8rem', sm: '1rem' }
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Pontos de Experiência Total" arrow>
                    <Chip
                      icon={<EmojiEvents />}
                      label={`${xpAtual.toLocaleString()} XP`}
                      color="secondary"
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: { xs: '0.8rem', sm: '1rem' } 
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* ✅ CORREÇÃO: Botão responsivo */}
            <Button
              variant={editMode ? "outlined" : "contained"}
              startIcon={<Edit />}
              onClick={() => setEditMode(!editMode)}
              sx={{
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                boxShadow: editMode ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                width: { xs: '100%', sm: 'auto' }, // ✅ Largura total no mobile
                mt: { xs: 1, sm: 0 }, // ✅ Margin top apenas no mobile
              }}
            >
              {editMode ? 'Cancelar' : 'Editar Perfil'}
            </Button>
          </Box>

          {/* Barra de Progresso Real */}
          <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp fontSize="small" />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Progresso para {nextLevel ? `Nível ${nextLevel.nivel}` : 'Nível Máximo'}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  {nextLevel ? `Nv. ${nextLevel.nivel}` : 'Máx.'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                {xpAtual.toLocaleString()} / {xpNextLevel.toLocaleString()} XP
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

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mt: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {xpCurrentLevel.toLocaleString()} XP (Nv. {nivelAtual})
              </Typography>
              
              {nextLevel ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="primary" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {progressPercentage.toFixed(1)}% concluído
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Faltam {(xpNextLevel - xpAtual).toLocaleString()} XP
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  🎉 Nível Máximo!
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {xpNextLevel.toLocaleString()} XP {nextLevel ? `(Nv. ${nextLevel.nivel})` : '(Máx.)'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {updateProfile.isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Erro ao atualizar perfil. Tente novamente.
          </Alert>
        )}

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
                  Minhas Estatísticas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Nível Atual</Typography>
                    <Chip 
                      label={nivelAtual} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Categoria</Typography>
                    <Chip 
                      label={getLevelName(nivelAtual)} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(getNivelColor(nivelAtual), 0.2),
                        color: getNivelColor(nivelAtual),
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total de XP</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {xpAtual.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {nextLevel && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">XP para Nv. {nextLevel.nivel}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {(xpNextLevel - xpAtual).toLocaleString()}
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

            {/* Seleção de Títulos */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents color="primary" />
                  Meus Títulos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecione um título para equipar
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {levels?.slice(0, 5).map((title) => {
                    const available = isTitleAvailable(title);
                    const equipped = isTitleEquipped(title.id);
                    const titleColor = getTitleColor(title.nivel); // ✅ Cor do título

                    return (
                      <Card 
                        key={title.id}
                        sx={{ 
                          mb: 1,
                          border: equipped ? 2 : 1,
                          borderColor: equipped ? titleColor : 'grey.300',
                          backgroundColor: equipped ? alpha(titleColor, 0.1) : 'background.paper',
                          opacity: available ? 1 : 0.6,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: titleColor }}>
                                {title.titulo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Nv. {title.nivel} • {title.xp_necessario} XP
                              </Typography>
                            </Box>
                            
                            {equipped ? (
                              <CheckCircle sx={{ color: titleColor }} />
                            ) : (
                              <Button
                                size="small"
                                variant={available ? "contained" : "outlined"}
                                disabled={!available || equipTitle.isPending}
                                onClick={() => handleEquipTitle(title)}
                                sx={{ 
                                  minWidth: 80,
                                  backgroundColor: available ? titleColor : undefined,
                                  '&:hover': {
                                    backgroundColor: available ? alpha(titleColor, 0.8) : undefined,
                                  }
                                }}
                              >
                                {available ? 'Equipar' : 'Bloq.'}
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>

                {levels && levels.length > 5 && (
                  <Button 
                    fullWidth 
                    variant="text" 
                    size="small"
                    component={Link}
                    to="/progresso"
                    sx={{ mt: 1 }}
                  >
                    Ver todos os títulos
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Coluna da Direita - Conteúdo Principal */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
              {editMode ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Edit color="primary" />
                    Editar Perfil
                  </Typography>

                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="CEP"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      inputProps={{ maxLength: 9 }}
                      error={formData.cep.length > 0 && formData.cep.replace(/\D/g, '').length < 8}
                      helperText={
                        formData.cep.length > 0 && formData.cep.replace(/\D/g, '').length < 8
                          ? "CEP deve conter 8 dígitos"
                          : "Digite o CEP para buscar automaticamente estado e cidade"
                      }
                    />
                    <TextField
                      fullWidth
                      label="Estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      disabled
                      InputProps={{
                        endAdornment: loadingCep ? <CircularProgress size={20} /> : null,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      disabled
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                    placeholder="Conte um pouco sobre você..."
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Groups color="primary" />
                      Grupos de Vulnerabilidade
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Selecione os grupos que fazem parte da sua realidade
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {grupos?.map((grupo) => (
                        <Chip
                          key={grupo.id}
                          label={`${grupo.categoria} - ${grupo.tipo}`}
                          onClick={() => {
                            setGruposSelecionados(prev =>
                              prev.includes(grupo.id)
                                ? prev.filter(id => id !== grupo.id)
                                : [...prev, grupo.id]
                            );
                          }}
                          color={gruposSelecionados.includes(grupo.id) ? "primary" : "default"}
                          variant={gruposSelecionados.includes(grupo.id) ? "filled" : "outlined"}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={updateProfile.isPending}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {updateProfile.isPending ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                  </Button>
                </Box>
              ) : (
                <Box>
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
                      
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="500">{user.email}</Typography>
                      </Grid>
                      
                      {user.cep && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">CEP</Typography>
                          <Typography variant="body1" fontWeight="500">{exibirCEPFormatado(user.cep)}</Typography>
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
                          Sobre Mim
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
                          Meus Grupos de Vulnerabilidade
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
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Adicione uma bio e grupos de vulnerabilidade para personalizar seu perfil.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                      >
                        Editar Perfil
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog de Confirmação de Título */}
      <Dialog open={titleDialogOpen} onClose={() => setTitleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 40, color: selectedTitle ? getTitleColor(selectedTitle.nivel) : 'primary.main', mb: 1 }} />
          <Typography variant="h6">Equipar Título</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" gutterBottom>
            Deseja equipar o título:
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            gutterBottom
            sx={{ color: selectedTitle ? getTitleColor(selectedTitle.nivel) : 'primary.main' }}
          >
            "{selectedTitle?.titulo}"
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            {selectedTitle?.descricao || "Este título será exibido no seu perfil."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button onClick={() => setTitleDialogOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={confirmEquipTitle} 
            variant="contained"
            disabled={equipTitle.isPending}
            startIcon={equipTitle.isPending ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{
              backgroundColor: selectedTitle ? getTitleColor(selectedTitle.nivel) : undefined,
              '&:hover': {
                backgroundColor: selectedTitle ? alpha(getTitleColor(selectedTitle.nivel), 0.8) : undefined,
              }
            }}
          >
            {equipTitle.isPending ? 'Equipando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar para confirmação de título equipado */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfile;