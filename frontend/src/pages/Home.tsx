import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,
  Grow,
  Zoom,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Forum,
  School,
  Work,
  Groups,
  Map,
  Diversity3,
  Psychology,
  Chat,
  TrendingUp,
  EmojiEvents,
  KeyboardArrowDown,
  AutoAwesome,
  MilitaryTech,
  Star,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import logo from '../assets/SIS_logo.png';

const Home: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Efeito de digitação para o texto de boas-vindas
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const welcomeText = `Bem-vindo de volta, ${user?.nome.split(' ')[0] || 'Amigo'}!`;

  useEffect(() => {
    if (user && currentIndex < welcomeText.length) {
      const timer = setTimeout(() => {
        setDisplayText(welcomeText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, currentIndex, welcomeText]);

  // Esconder a seta de scroll após rolar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Informação e Orientação',
      description: 'Direitos, cursos e serviços públicos com orientação personalizada para suas necessidades.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Map sx={{ fontSize: 40 }} />,
      title: 'Mapeamento de Necessidades',
      description: 'Ferramentas para identificar e acompanhar necessidades locais e políticas públicas.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Groups sx={{ fontSize: 40 }} />,
      title: 'Rede de Apoio',
      description: 'Conecte-se com outras pessoas para trocar experiências e criar uma rede de apoio mútuo.',
      color: theme.palette.info.main,
    },
    {
      icon: <Diversity3 sx={{ fontSize: 40 }} />,
      title: 'Equidade e Inclusão',
      description: 'Conteúdos focados em equidade racial, de gênero e acessibilidade para todos.',
      color: theme.palette.warning.main,
    },
  ];

  const quickActions = [
    {
      icon: <Forum />,
      title: 'Fórum',
      description: 'Participe de discussões e compartilhe experiências',
      path: '/forum',
      color: theme.palette.primary.main,
    },
    {
      icon: <School />,
      title: 'Cursos',
      description: 'Capacitação e desenvolvimento de habilidades',
      path: '/cursos',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Work />,
      title: 'Vagas',
      description: 'Oportunidades de emprego inclusivas',
      path: '/vagas',
      color: theme.palette.info.main,
    },
    {
      icon: <Chat />,
      title: 'Chat',
      description: 'Converse com outros usuários da comunidade',
      path: '/chat',
      color: theme.palette.success.main,
    },
  ];

  const userStats = [
    { label: 'Nível Atual', value: user?.nivel_atual || 1, icon: <MilitaryTech /> },
    { label: 'XP Total', value: user?.xp_atual || 0, icon: <EmojiEvents /> },
    { label: 'Título', value: user?.titulo_equipado_id || 'Iniciante', icon: <Star /> },
  ];

  const recentActivities = [
    { action: 'Post no fórum', xp: 50, time: '2h atrás' },
    { action: 'Curso concluído', xp: 100, time: '1 dia atrás' },
    { action: 'Perfil completo', xp: 150, time: '2 dias atrás' },
  ];

  if (!user) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        {/* Hero Section - Agora cobre a tela inteira */}
        <Box
          sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Elementos decorativos de fundo */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#fff', 0.05)} 0%, transparent 70%)`,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Fade in timeout={1000}>
                  <Box>
                    <Typography
                      variant="h1"
                      component="h1"
                      gutterBottom
                      sx={{
                        fontSize: isMobile ? '2.5rem' : '3.5rem',
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1.2,
                        mb: 2,
                      }}
                    >
                      Sistema de 
                      <Box component="span" sx={{ color: theme.palette.secondary.light }}>
                        {' '}Inclusão Social
                      </Box>
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 4,
                        opacity: 0.9,
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        lineHeight: 1.6,
                      }}
                    >
                      Conectando pessoas e promovendo inclusão através da tecnologia. 
                      Junte-se à nossa comunidade e faça a diferença.
                    </Typography>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/registrar"
                        sx={{
                          bgcolor: 'white',
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: alpha('#fff', 0.9),
                            transform: 'translateY(-2px)',
                          },
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        }}
                      >
                        Começar Agora
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        to="/sobre"
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: alpha('#fff', 0.1),
                            transform: 'translateY(-2px)',
                          },
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Saiba Mais
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Slide direction="left" in timeout={1000}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        background: alpha('#fff', 0.1),
                        borderRadius: 4,
                        p: 4,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha('#fff', 0.2)}`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      }}
                    >
                      <img
                        src={logo}
                        alt="Logo do Sistema de Inclusão Social"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: isMobile ? '200px' : '300px',
                          filter: 'brightness(0) invert(1)',
                        }}
                      />
                    </Box>
                  </Box>
                </Slide>
              </Grid>
            </Grid>
          </Container>

          {/* Seta indicadora de scroll */}
          {showScrollHint && (
            <Fade in={showScrollHint}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  animation: 'bounce 2s infinite',
                  '@keyframes bounce': {
                    '0%, 20%, 50%, 80%, 100%': {
                      transform: 'translateX(-50%) translateY(0)',
                    },
                    '40%': {
                      transform: 'translateX(-50%) translateY(-10px)',
                    },
                    '60%': {
                      transform: 'translateX(-50%) translateY(-5px)',
                    },
                  },
                }}
              >
                <IconButton
                  sx={{
                    color: 'white',
                    border: `2px solid ${alpha('#fff', 0.5)}`,
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.1),
                    },
                  }}
                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  <KeyboardArrowDown sx={{ fontSize: 32 }} />
                </IconButton>
              </Box>
            </Fade>
          )}
        </Box>

        {/* Conteúdo abaixo da hero section */}
        <Container maxWidth="lg">
          {/* Features Section */}
          <Box sx={{ py: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ mb: 6 }}
            >
              Como Ajudamos na Inclusão Social
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Grow in timeout={(index + 1) * 500}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                        },
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <Box
                          sx={{
                            color: feature.color,
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Quick Actions Section */}
          <Box sx={{ py: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ mb: 6 }}
            >
              Explore Nossa Plataforma
            </Typography>
            <Grid container spacing={3}>
              {quickActions.map((action, index) => (
                <Grid key={index} size={{ xs: 12, md: 6, lg: 3 }}>
                  <Zoom in timeout={(index + 1) * 500}>
                    <Card
                      sx={{
                        height: '100%',
                        border: `2px solid ${alpha(action.color, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: alpha(action.color, 0.5),
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 32px ${alpha(action.color, 0.2)}`,
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <Box
                          sx={{
                            color: action.color,
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {React.cloneElement(action.icon, { sx: { fontSize: 48 } })}
                        </Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                          {action.description}
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          to={action.path}
                          endIcon={<ArrowForward />}
                          sx={{
                            bgcolor: action.color,
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: alpha(action.color, 0.8),
                              transform: 'translateX(4px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Acessar
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Section */}
          <Box sx={{ py: 8 }}>
            <Paper
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                p: 6,
                textAlign: 'center',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Pronto para fazer parte da mudança?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
                Junte-se à nossa comunidade e comece sua jornada de inclusão e desenvolvimento social.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/registrar"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }}
              >
                Cadastre-se Gratuitamente
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  // Logged in user view - MUITO MELHORADA
  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)` }}>
      <Container maxWidth="lg">
        {/* Hero Section para usuário logado */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Fade in timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                    }}
                  >
                    {displayText}
                    <Box 
                      component="span" 
                      sx={{ 
                        animation: 'blink 1s infinite',
                        '@keyframes blink': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0 },
                        }
                      }}
                    >
                      |
                    </Box>
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6 }}
                  >
                    Continue sua jornada de desenvolvimento e inclusão. 
                    A comunidade está aqui para apoiar você!
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Slide direction="left" in timeout={1000}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '3rem',
                      border: `4px solid ${theme.palette.secondary.main}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }}
                  >
                    {user.nome.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {userStats.map((stat, index) => (
              <Grid key={index} size={{ xs: 12, sm: 4 }}>
                <Grow in timeout={(index + 1) * 500}>
                  <Card
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Progress Section */}
        <Box sx={{ mb: 6 }}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUp color="primary" />
              Seu Progresso
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Nível {user.nivel_atual}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Próximo nível em {Math.max(0, 1000 - (user.xp_atual % 1000))} XP
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(user.xp_atual % 1000) / 10}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                }}
              />
            </Box>

            <Button
              variant="outlined"
              component={Link}
              to="/progresso"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Ver Progresso Detalhado
            </Button>
          </Card>
        </Box>

        {/* Quick Actions Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            Acesso Rápido
          </Typography>
          
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Grow in timeout={(index + 1) * 300}>
                  <Button
                    variant="contained"
                    component={Link}
                    to={action.path}
                    size="large"
                    fullWidth
                    startIcon={action.icon}
                    sx={{
                      py: 2.5,
                      borderRadius: 2,
                      bgcolor: action.color,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        bgcolor: alpha(action.color, 0.8),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 16px ${alpha(action.color, 0.3)}`,
                    }}
                  >
                    {action.title}
                  </Button>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Community Highlights */}
        <Box sx={{ mb: 6 }}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Groups color="primary" />
              Destaques da Comunidade
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body1">
                    <strong>125+</strong> novos membros esta semana
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body1">
                    <strong>42</strong> oportunidades postadas
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body1">
                    <strong>89</strong> discussões ativas
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary">
                    Sua Contribuição é Importante!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Compartilhe sua experiência e ajude outros membros da comunidade.
                  </Typography>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/forum"
                    size="small"
                  >
                    Participar do Fórum
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;