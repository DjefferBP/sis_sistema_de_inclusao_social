// frontend/src/pages/Courses.tsx - Com redirecionamento automático
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useCourses, useCourseAreas, useCurrentUser } from '../services/hooks';
import type { Curso} from '../types';
import { Navigate} from 'react-router-dom';

// Error Boundary Component
class CoursesErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro no componente Courses:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Tentar Novamente
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Ops! Algo deu errado
            </Typography>
            <Typography variant="body2">
              {this.state.error?.message || 'Erro ao carregar cursos'}
            </Typography>
            <details style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
              <summary>Detalhes do erro</summary>
              {this.state.error?.stack}
            </details>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Main Courses Component
const Courses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  const { data: coursesData, isLoading, error } = useCourses();
  const { data: areas } = useCourseAreas();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  let courses: Curso[] = [];
  
  // Verifica se o usuário não está autenticado e não está carregando
  useEffect(() => {
    if (!userLoading && !currentUser) {
      setShouldRedirect(true);
    }
  }, [currentUser, userLoading]);

  // Redireciona para login se não estiver autenticado
  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: '/cursos' }} replace />;
  }

  // Mostra loading enquanto verifica autenticação
  if (userLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Verificando autenticação...</Typography>
        </Box>
      </Container>
    );
  }

  // Processa os dados dos cursos
  if (coursesData) {
    if (Array.isArray(coursesData)) {
      courses = coursesData;
    } 
    else if ('cursos' in coursesData && Array.isArray(coursesData.cursos)) {
      courses = coursesData.cursos;
    }
    else if ('items' in coursesData && Array.isArray(coursesData.items)) {
      courses = coursesData.items as Curso[];
    }
    else if (typeof coursesData === 'object') {
      // Tenta encontrar array em qualquer propriedade
      const arrayKey = Object.keys(coursesData).find(key => 
        Array.isArray((coursesData as any)[key])
      );
      if (arrayKey) {
        courses = (coursesData as any)[arrayKey];
      }
    }
  }

  const filteredCourses = courses.filter((curso: Curso) => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (curso.descricao && curso.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = !selectedArea || curso.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
            >
              Recarregar
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Erro ao carregar cursos
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando cursos...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Cursos Disponíveis
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="textSecondary" paragraph>
          Encontre cursos gratuitos e oportunidades de capacitação profissional
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Área</InputLabel>
            <Select
              value={selectedArea}
              label="Área"
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <MenuItem value="">Todas as áreas</MenuItem>
              {areas?.map((area: string) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${filteredCourses.length} cursos encontrados`}
            color="primary"
            variant="outlined"
          />
          {selectedArea && (
            <Chip
              label={`Área: ${selectedArea}`}
              onDelete={() => setSelectedArea('')}
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredCourses.map((curso: Curso) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={curso.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {curso.imagem_url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={curso.imagem_url}
                  alt={curso.titulo}
                  onError={(e) => {
                    // Fallback para imagem quebrada
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {curso.titulo}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {curso.descricao || 'Sem descrição disponível.'}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  {curso.area && (
                    <Chip 
                      label={curso.area} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {curso.modalidade && (
                      <Typography variant="body2" color="textSecondary">
                        📚 {curso.modalidade}
                      </Typography>
                    )}
                    {curso.carga_horaria && (
                      <Typography variant="body2" color="textSecondary">
                        ⏱️ {curso.carga_horaria}
                      </Typography>
                    )}
                    {curso.gratuito && (
                      <Typography variant="body2" color="success.main">
                        💰 {curso.gratuito}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  component="a" 
                  href={curso.url_curso} 
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!curso.url_curso}
                >
                  {curso.url_curso ? 'Acessar Curso' : 'Link Indisponível'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Nenhum curso encontrado
          </Typography>
          <Typography color="textSecondary">
            {courses.length > 0 ? 'Tente ajustar os filtros de busca' : 'Nenhum curso disponível no momento'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

// Componente final com Error Boundary
const CoursesWithErrorBoundary: React.FC = () => (
  <CoursesErrorBoundary>
    <Courses />
  </CoursesErrorBoundary>
);

export default CoursesWithErrorBoundary;