import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Grid,
    Card,
    CardContent,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Avatar,
} from '@mui/material';
import { Search, Business, LocationOn, Schedule, Work, TrendingUp, OpenInNew } from '@mui/icons-material';
import { useJobSearch } from '../services/hooks';
import type { TrabalhoFiltros, VagaTrabalhoAPI, TrabalhoResponse } from '../types';

const Jobs: React.FC = () => {
    const [filters, setFilters] = useState<TrabalhoFiltros>({
        field: '',
        location: '',
        page: 1,
        sort_by: '',
        job_type: '',
        experience_level: '',
        work_type: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const { data: jobsData, isLoading, error } = useJobSearch(
        submitted ? filters : { field: '', location: '', page: 1 }
    );

    // Cast para o tipo correto
    const jobsResponse = jobsData as TrabalhoResponse | undefined;
    const vagas = jobsResponse?.vagas || [];
    const totalVagas = jobsResponse?.total_vagas || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const handleFilterChange = (field: keyof TrabalhoFiltros, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            ...(field !== 'page' ? { page: 1 } : {}), // Reset para página 1 quando mudar outros filtros
        }));
    };

    const handlePageChange = (newPage: number) => {
        handleFilterChange('page', newPage);
    };

    const clearFilters = () => {
        setFilters({
            field: '',
            location: '',
            page: 1,
            sort_by: '',
            job_type: '',
            experience_level: '',
            work_type: '',
        });
        setSubmitted(false);
    };

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    // Função para extrair nível de experiência do título (heurística)
    const extrairNivelExperiencia = (titulo: string): string => {
        const tituloLower = titulo.toLowerCase();
        if (tituloLower.includes('estágio') || tituloLower.includes('estagio') || tituloLower.includes('trainee')) {
            return 'Estágio';
        } else if (tituloLower.includes('júnior') || tituloLower.includes('junior')) {
            return 'Júnior';
        } else if (tituloLower.includes('pleno')) {
            return 'Pleno';
        } else if (tituloLower.includes('sênior') || tituloLower.includes('senior')) {
            return 'Sênior';
        }
        return 'Não especificado';
    };

    // Função para extrair tipo de trabalho do título (heurística)
    const extrairTipoTrabalho = (titulo: string): string => {
        const tituloLower = titulo.toLowerCase();
        if (tituloLower.includes('full stack') || tituloLower.includes('fullstack')) {
            return 'Full Stack';
        } else if (tituloLower.includes('front end') || tituloLower.includes('frontend')) {
            return 'Frontend';
        } else if (tituloLower.includes('back end') || tituloLower.includes('backend')) {
            return 'Backend';
        } else if (tituloLower.includes('mobile')) {
            return 'Mobile';
        } else if (tituloLower.includes('java')) {
            return 'Java';
        } else if (tituloLower.includes('javascript')) {
            return 'JavaScript';
        }
        return 'Desenvolvimento';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Cabeçalho */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    🔍 Busca de Vagas
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    Encontre oportunidades de trabalho que combinam com você
                </Typography>
            </Box>

            {/* Formulário de Filtros */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Search /> Filtros de Busca
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Campo Obrigatório: Cargo */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <TextField
                                fullWidth
                                label="Cargo desejado *"
                                placeholder="Ex: Desenvolvedor, Designer, Analista..."
                                value={filters.field}
                                onChange={(e) => handleFilterChange('field', e.target.value)}
                                required
                                helperText="Digite o cargo ou área de interesse"
                            />
                        </Grid>

                        {/* Campo Obrigatório: Localização */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <TextField
                                fullWidth
                                label="Localização *"
                                placeholder="Ex: São Paulo, Brasil, Remoto..."
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                required
                                helperText="Cidade, estado ou país"
                            />
                        </Grid>

                        {/* Filtros Opcionais */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <FormControl fullWidth>
                                <InputLabel>Período de publicação</InputLabel>
                                <Select
                                    value={filters.sort_by}
                                    label="Período de publicação"
                                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="dia">Último dia</MenuItem>
                                    <MenuItem value="semana">Última semana</MenuItem>
                                    <MenuItem value="mês">Último mês</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <FormControl fullWidth>
                                <InputLabel>Nível de experiência</InputLabel>
                                <Select
                                    value={filters.experience_level}
                                    label="Nível de experiência"
                                    onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="estágio">Estágio</MenuItem>
                                    <MenuItem value="júnior">Júnior</MenuItem>
                                    <MenuItem value="pleno">Pleno</MenuItem>
                                    <MenuItem value="sênior">Sênior</MenuItem>
                                    <MenuItem value="diretor">Diretor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <FormControl fullWidth>
                                <InputLabel>Tipo de vaga</InputLabel>
                                <Select
                                    value={filters.job_type}
                                    label="Tipo de vaga"
                                    onChange={(e) => handleFilterChange('job_type', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="tempo integral">Tempo integral</MenuItem>
                                    <MenuItem value="meio período">Meio período</MenuItem>
                                    <MenuItem value="contrato">Contrato</MenuItem>
                                    <MenuItem value="temporário">Temporário</MenuItem>
                                    <MenuItem value="voluntário">Voluntário</MenuItem>
                                    <MenuItem value="estágio">Estágio</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <FormControl fullWidth>
                                <InputLabel>Modalidade de trabalho</InputLabel>
                                <Select
                                    value={filters.work_type}
                                    label="Modalidade de trabalho"
                                    onChange={(e) => handleFilterChange('work_type', e.target.value)}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="presencial">Presencial</MenuItem>
                                    <MenuItem value="remoto">Remoto</MenuItem>
                                    <MenuItem value="híbrido">Híbrido</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Botões */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={!filters.field || !filters.location || isLoading}
                                    startIcon={<Search />}
                                >
                                    {isLoading ? <CircularProgress size={20} /> : 'Buscar Vagas'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={clearFilters}
                                    disabled={isLoading}
                                >
                                    Limpar Filtros
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Resultados */}
            {submitted && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work /> Resultados da Busca
                        </Typography>

                        {totalVagas > 0 && (
                            <Chip
                                label={`${totalVagas} vaga${totalVagas !== 1 ? 's' : ''} encontrada${totalVagas !== 1 ? 's' : ''}`}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            Erro ao buscar vagas: {error.message}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : vagas.length > 0 ? (
                        <>
                            {/* Lista de Vagas */}
                            <Grid container spacing={3}>
                                {vagas.map((vaga: VagaTrabalhoAPI) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vaga.job_id}>
                                        <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 } }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                                                        {/* Logo da Empresa */}
                                                        {vaga.company_logo_url && (
                                                            <Avatar
                                                                src={vaga.company_logo_url}
                                                                sx={{ width: 60, height: 60 }}
                                                                variant="rounded"
                                                            />
                                                        )}

                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                                {vaga.job_position}
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                <Business fontSize="small" color="action" />
                                                                <Typography variant="body1" color="textSecondary">
                                                                    {vaga.company_name}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                <LocationOn fontSize="small" color="action" />
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {vaga.job_location}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1}}>
                                                        <Chip
                                                            icon={<Schedule fontSize="small" />}
                                                            label={formatarData(vaga.job_posting_date)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Tags informativas */}
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                                    <Chip
                                                        label={extrairNivelExperiencia(vaga.job_position)}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                    <Chip
                                                        label={extrairTipoTrabalho(vaga.job_position)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>

                                                {/* Botão de ação */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        href={vaga.job_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        endIcon={<OpenInNew />}
                                                        sx={{ minWidth: '200px' }}
                                                    >
                                                        Ver Vaga no LinkedIn
                                                    </Button>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                                                            ID: {vaga.job_id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Paginação */}
                            {totalVagas > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
                                    <Button
                                        variant="outlined"
                                        disabled={(filters.page || 1) <= 1}
                                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                                    >
                                        Anterior
                                    </Button>

                                    <Typography variant="body2">
                                        Página {filters.page || 1}
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        onClick={() => handlePageChange((filters.page || 1) + 1)}
                                    >
                                        Próxima
                                    </Button>
                                </Box>
                            )}
                        </>
                    ) : submitted && !isLoading ? (
                        <Alert severity="info">
                            {jobsResponse?.mensagem || 'Nenhuma vaga encontrada com os filtros selecionados. Tente ajustar os critérios de busca.'}
                        </Alert>
                    ) : null}
                </Paper>
            )}

            {/* Informações quando não há busca */}
            {!submitted && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Comece sua busca por oportunidades
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Preencha os campos obrigatórios de cargo e localização para encontrar vagas que combinam com seu perfil.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Use os filtros opcionais para refinar sua busca e encontrar a oportunidade ideal.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default Jobs;