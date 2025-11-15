import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  History,
  Star,
  MilitaryTech,
  CheckCircle,
  AutoAwesome,
} from '@mui/icons-material';
import { useUserProgress, useXPHistory, useLevels } from '../services/hooks';

const Progress: React.FC = () => {
  const { data: userProgress, isLoading: progressLoading, error: progressError } = useUserProgress();
  const { data: xpHistory, isLoading: historyLoading, error: historyError } = useXPHistory();
  const { data: levels, isLoading: levelsLoading, error: levelsError } = useLevels();

  const isLoading = progressLoading || historyLoading || levelsLoading;

  // Encontrar o nível atual e próximo
  const nivelAtual = levels?.find(level => level.nivel === userProgress?.nivel_atual);
  const proximoNivel = levels?.find(level => level.nivel === (userProgress?.nivel_atual || 0) + 1);

  // Calcular progresso para o próximo nível
  const xpAtual = userProgress?.xp_atual || 0;
  const xpNecessarioProximoNivel = proximoNivel?.xp_necessario || 0;
  const xpNivelAtual = nivelAtual?.xp_necessario || 0;

  // Cálculo seguro do progresso
  let progressoPercentual = 0;
  if (proximoNivel && xpNivelAtual !== undefined) {
    if (xpNivelAtual === 0) {
      progressoPercentual = Math.min((xpAtual / xpNecessarioProximoNivel) * 100, 100);
    } else {
      const xpParaProximo = xpNecessarioProximoNivel - xpNivelAtual;
      const xpConquistado = xpAtual - xpNivelAtual;
      progressoPercentual = Math.min((xpConquistado / xpParaProximo) * 100, 100);
    }
  } else {
    progressoPercentual = 100;
  }

  const xpParaProximoNivel = Math.max(0, xpNecessarioProximoNivel - xpAtual);
  const progressoSeguro = Math.max(0, Math.min(progressoPercentual, 100));

  // Formatar data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Mostrar erros se houver
  if (progressError || historyError || levelsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Erro ao carregar dados de progresso
          </Typography>
          {progressError && <div>Erro no progresso: {progressError.message}</div>}
          {historyError && <div>Erro no histórico: {historyError.message}</div>}
          {levelsError && <div>Erro nos níveis: {levelsError.message}</div>}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          🏆 Meu Progresso
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Acompanhe sua evolução na comunidade
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna da Esquerda - Progresso Principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Card de Nível Atual */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {userProgress?.nivel_atual || 1}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Nível {userProgress?.nivel_atual || 1}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {nivelAtual?.titulo || 'Iniciante'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {nivelAtual?.descricao || 'Continue participando para evoluir!'}
                </Typography>
              </Box>
            </Box>

            {/* Barra de Progresso */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {xpAtual.toLocaleString()} XP
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {proximoNivel ? `${xpNecessarioProximoNivel.toLocaleString()} XP` : 'Nível Máximo'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressoSeguro}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    backgroundColor: 'primary.main',
                  }
                }}
              />
              
              {/* Texto do Progresso do Nível */}
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  {proximoNivel ? (
                    <>
                      <strong>{Math.round(progressoSeguro)}%</strong> do caminho para o nível {proximoNivel.nivel} • 
                      Faltam <strong>{xpParaProximoNivel.toLocaleString()} XP</strong>
                    </>
                  ) : (
                    <strong>🎉 Você alcançou o nível máximo!</strong>
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Informações do Próximo Nível */}
            {proximoNivel && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.100'
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp fontSize="small" />
                  Próximo nível: {proximoNivel.titulo}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {proximoNivel.descricao || 'Continue sua jornada na comunidade!'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Título Equipado */}
          {userProgress?.titulo_equipado && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MilitaryTech color="primary" />
                Título Atual
              </Typography>
              <Chip
                label={userProgress.titulo_equipado}
                color="primary"
                variant="filled"
                size="medium"
                sx={{ 
                  fontSize: '1.1rem', 
                  py: 2, 
                  px: 3,
                  height: 'auto',
                  minHeight: '40px'
                }}
              />
            </Paper>
          )}

          {/* Histórico de XP */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <History color="primary" />
              Histórico de Conquistas
            </Typography>

            {xpHistory && xpHistory.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {xpHistory.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                          <Star fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {item.acao}
                            </Typography>
                            <Chip 
                              label={`+${item.xp_ganho} XP`} 
                              size="small" 
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary" component="span">
                              {item.descricao}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              {formatarData(item.data_acao)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < xpHistory.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                Ainda não há conquistas registradas. Participe da comunidade para ganhar XP!
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Coluna da Direita - Informações Adicionais */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="primary" />
              Estatísticas
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  XP Total:
                </Typography>
                <Chip 
                  label={xpAtual.toLocaleString()} 
                  size="small" 
                  color="primary"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Nível Atual:
                </Typography>
                <Chip 
                  label={userProgress?.nivel_atual || 1} 
                  size="small" 
                  color="secondary"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Progresso:
                </Typography>
                <Chip 
                  label={`${Math.round(progressoSeguro)}%`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>

          {/* Próximos Níveis */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              Próximos Níveis
            </Typography>

            {levels && levels.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {levels
                  .filter(level => level.nivel > (userProgress?.nivel_atual || 1))
                  .slice(0, 3)
                  .map(level => (
                    <Card key={level.nivel} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" color="primary">
                            Nível {level.nivel}
                          </Typography>
                          <Chip 
                            label={`${level.xp_necessario.toLocaleString()} XP`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {level.titulo}
                        </Typography>
                        {level.descricao && (
                          <Typography variant="caption" color="textSecondary">
                            {level.descricao}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))
                }
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Carregando informações dos níveis...
              </Alert>
            )}
          </Paper>

          {/* Dicas para Ganhar XP */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="primary" />
              Como Ganhar XP
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Criar posts no fórum" secondary="+50 XP" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Comentar em posts" secondary="+20 XP" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Curtir conteúdo" secondary="+5 XP" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Completar perfil" secondary="+100 XP" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Progress;