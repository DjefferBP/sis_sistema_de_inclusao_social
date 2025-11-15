import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Lock,
  Email,
  Person,
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        py: 2,
      }}
    >
      <Container maxWidth="md" sx={{ height: '100%' }}>
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, md: 7, lg: 7 }}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 2, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    mb: 2
                  }}
                >
                  <Lock sx={{ fontSize: 30 }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  Acessar Plataforma
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Entre na sua conta para continuar sua jornada de inclusão
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <Email 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mr: 1
                        }} 
                      />
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                    mb: 2
                  }}
                />

                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <Lock 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mr: 1
                        }} 
                      />
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                    mb: 1
                  }}
                />

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    component={Link}
                    to="/recuperar-senha"
                    sx={{ 
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Esqueceu sua senha?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    mb: 3
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Entrar na Plataforma'
                  )}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Não tem conta?
                  </Typography>
                </Divider>

                <Box textAlign="center">
                  <Button
                    component={Link}
                    to="/registrar"
                    variant="outlined"
                    size="large"
                    startIcon={<Person />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    Criar Conta Gratuita
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  🔒 Suas informações estão seguras conosco
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;