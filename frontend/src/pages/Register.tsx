import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  LocationOn,
  Description,
  Groups,
  CheckCircle,
} from '@mui/icons-material';
import { useGruposVulnerabilidade } from '../services/hooks';

// Interface para os erros de validação
interface ValidationErrors {
  nome?: string;
  email?: string;
  senha?: string;
  cep?: string;
  geral?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cep: '',
    estado: '',
    cidade: '',
    bio: '',
  });
  const [gruposSelecionados, setGruposSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: grupos, isLoading: loadingGrupos } = useGruposVulnerabilidade();

  const steps = ['Informações Pessoais', 'Localização', 'Perfil Social'];

  // Funções de validação
  const validarNome = (nome: string): string | undefined => {
    if (nome.length < 6) return 'O nome deve ter pelo menos 6 caracteres';
    if (nome.length > 150) return 'O nome deve ter no máximo 150 caracteres';
    return undefined;
  };

  const validarEmail = (email: string): string | undefined => {
    if (!email) return 'O email é obrigatório';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Digite um email válido (exemplo: usuario@provedor.com)';
    }
    
    const dominioValido = /\.(com|net|org|edu|gov|br|io|co|info|biz|me|tv|us|uk|ca|de|fr|it|es|pt|ru|cn|jp|au|nz|in)$/i;
    if (!dominioValido.test(email.split('@')[1])) {
      return 'O domínio do email deve ser válido (.com, .net, .org, etc.)';
    }
    
    return undefined;
  };

  const validarSenha = (senha: string): string | undefined => {
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    if (senha.length > 100) return 'A senha deve ter no máximo 100 caracteres';
    return undefined;
  };

  const validarCEP = (cep: string): string | undefined => {
    if (cep && cep.replace(/\D/g, '').length !== 8) {
      return 'CEP deve conter 8 dígitos';
    }
    return undefined;
  };

  // Validação geral do formulário
  const validarFormulario = (step?: number): boolean => {
    const novosErros: ValidationErrors = {};

    // Validações para cada step
    if (step === undefined || step === 0) {
      novosErros.nome = validarNome(formData.nome);
      novosErros.email = validarEmail(formData.email);
      novosErros.senha = validarSenha(formData.senha);
    }

    if (step === undefined || step === 1) {
      novosErros.cep = validarCEP(formData.cep);
    }

    // Remove undefined errors
    Object.keys(novosErros).forEach(key => {
      if (!novosErros[key as keyof ValidationErrors]) {
        delete novosErros[key as keyof ValidationErrors];
      }
    });

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
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

    if (cepLimpo.length !== 8) {
      return;
    }

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

  const handleNext = () => {
    // Valida o step atual antes de avançar
    if (!validarFormulario(activeStep)) {
      return;
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
  if (!validarFormulario()) {
    return;
  }

  setLoading(true);
  setErrors({});

  try {
    await register({
      ...formData,
      grupos_vulnerabilidade: gruposSelecionados,
    });
    navigate('/');
  } catch (err: any) {
    console.log('Erro no registro:', err);
    
    // PELA SUA DESCRIÇÃO: O erro vem como string direta no response.data
    if (err.response?.status === 404) {
      // Se for 404, é CEP não encontrado
      const errorMessage = err.response?.data?.detail || 'CEP não encontrado';
      setErrors({ cep: errorMessage });
      setActiveStep(1);
      setLoading(false);
      return;
    }
    
    // Outros erros
    let mensagemErro = 'Erro ao criar conta';
    
    if (err.response?.data?.detail) {
      mensagemErro = err.response.data.detail;
    } else if (err.message) {
      mensagemErro = err.message;
    }

    setErrors({ geral: mensagemErro });
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      const cepFormatado = formatarCEP(value);
      setFormData(prev => ({
        ...prev,
        [name]: cepFormatado
      }));
      
      // Limpa erro do CEP quando usuário digitar
      if (errors.cep) {
        setErrors(prev => ({ ...prev, cep: undefined }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Limpa erro do campo quando usuário digitar
      if (errors[name as keyof ValidationErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  // Efeito para focar no campo CEP quando houver erro
  useEffect(() => {
    if (errors.cep && activeStep === 1) {
      // Rola para o campo CEP e foca nele
      const cepField = document.querySelector('input[name="cep"]') as HTMLInputElement;
      if (cepField) {
        setTimeout(() => {
          cepField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cepField.focus();
        }, 100);
      }
    }
  }, [errors.cep, activeStep]);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                error={!!errors.nome}
                helperText={
                  errors.nome || 
                  (formData.nome.length > 0 && `${formData.nome.length}/150 caracteres`) ||
                  "Seu nome completo (6-150 caracteres)"
                }
                InputProps={{
                  startAdornment: <Person sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!errors.email}
                helperText={errors.email || "Utilize um email válido que você acessa frequentemente"}
                InputProps={{
                  startAdornment: <Email sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                required
                error={!!errors.senha}
                helperText={
                  errors.senha || 
                  (formData.senha.length > 0 && `${formData.senha.length}/100 caracteres`) ||
                  "Senha deve ter entre 6 e 100 caracteres"
                }
                InputProps={{
                  startAdornment: <Lock sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="CEP (Opcional)"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                inputProps={{ maxLength: 9 }}
                error={!!errors.cep}
                helperText={
                  errors.cep || 
                  (formData.estado && formData.cidade ? `✅ ${formData.cidade} - ${formData.estado}` : 
                   loadingCep ? "Consultando CEP..." :
                   "Digite o CEP para preencher automaticamente cidade e estado")
                }
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: theme.palette.text.secondary, mr: 1 }} />,
                  endAdornment: loadingCep ? <CircularProgress size={20} /> : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled
                helperText={formData.estado ? "Preenchido automaticamente pelo CEP" : "Será preenchido pelo CEP"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                disabled
                helperText={formData.cidade ? "Preenchida automaticamente pelo CEP" : "Será preenchida pelo CEP"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bio (Opcional)"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={4}
                helperText="Conte um pouco sobre você, seus interesses e objetivos"
                InputProps={{
                  startAdornment: <Description sx={{ color: theme.palette.text.secondary, mr: 1, mt: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Grupos de Vulnerabilidade (Opcional)</InputLabel>
                <Select
                  multiple
                  value={gruposSelecionados}
                  onChange={(e) => setGruposSelecionados(e.target.value as number[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const grupo = grupos?.find(g => g.id === value);
                        return grupo ? (
                          <Chip 
                            key={value} 
                            label={`${grupo.categoria} - ${grupo.tipo}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                  disabled={loadingGrupos}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  {grupos?.map((grupo) => (
                    <MenuItem key={grupo.id} value={grupo.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {grupo.categoria}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {grupo.tipo}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Card de Benefícios */}
            <Grid size={{ xs: 12 }}>
              <Card 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="primary" />
                    Benefícios da Plataforma
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • Cursos gratuitos de capacitação
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • Rede de apoio e conexões
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • Acompanhamento de progresso
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Oportunidades de emprego inclusivas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return 'Step desconhecido';
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
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                  <Person sx={{ fontSize: 30 }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  Criar Conta
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Junte-se à nossa comunidade de inclusão social
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Exibe erros gerais (da API) */}
              {errors.geral && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  {errors.geral}
                </Alert>
              )}

              {/* Conteúdo do formulário */}
              <Box>
                {getStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      textTransform: 'none'
                    }}
                  >
                    Voltar
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      disabled={loading || loadingGrupos}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Continuar
                    </Button>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box textAlign="center">
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Já tem uma conta?
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<Person />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Fazer Login
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;