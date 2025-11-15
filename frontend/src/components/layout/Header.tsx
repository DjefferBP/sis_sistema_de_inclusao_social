// frontend/src/components/layout/Header.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Forum,
  People,
  Work,
  School,
  ExitToApp,
  History,
  TrendingUp,
  Dashboard,
  Chat,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // States para menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Menu do perfil (dropdown)
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <MenuItem 
        component={Link} 
        to="/meu-perfil"
        onClick={handleMenuClose}
      >
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        Meu Perfil
      </MenuItem>
      
      <MenuItem 
        component={Link} 
        to="/progresso"
        onClick={handleMenuClose}
      >
        <ListItemIcon>
          <TrendingUp fontSize="small" />
        </ListItemIcon>
        Meu Progresso
      </MenuItem>

      <MenuItem 
        component={Link} 
        to="/dashboard"
        onClick={handleMenuClose}
      >
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        Minhas Atividades
      </MenuItem>
      

      <Divider />

      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        Sair
      </MenuItem>
    </Menu>
  );

  // Conteúdo do Drawer mobile
  const mobileDrawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      {user && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6">{user.nome}</Typography>
          <Typography variant="body2">
            Nível {user.nivel_atual} • {user.xp_atual} XP
          </Typography>
        </Box>
      )}
      
      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/meu-perfil" onClick={toggleMobileDrawer}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Meu Perfil" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/progresso" onClick={toggleMobileDrawer}>
                <ListItemIcon><TrendingUp /></ListItemIcon>
                <ListItemText primary="Meu Progresso" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/minhas-atividades" onClick={toggleMobileDrawer}>
                <ListItemIcon><History /></ListItemIcon>
                <ListItemText primary="Histórico de XP" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard" onClick={toggleMobileDrawer}>
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText primary="Minhas Atividades" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 2 }} />

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/forum" onClick={toggleMobileDrawer}>
                <ListItemIcon><Forum /></ListItemIcon>
                <ListItemText primary="Fórum" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/usuarios" onClick={toggleMobileDrawer}>
                <ListItemIcon><People /></ListItemIcon>
                <ListItemText primary="Usuários" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/vagas" onClick={toggleMobileDrawer}>
                <ListItemIcon><Work /></ListItemIcon>
                <ListItemText primary="Vagas" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/cursos" onClick={toggleMobileDrawer}>
                <ListItemIcon><School /></ListItemIcon>
                <ListItemText primary="Cursos" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/chat" onClick={toggleMobileDrawer}>
                <ListItemIcon><Chat /></ListItemIcon>
                <ListItemText primary="Chat" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 2 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/cursos" onClick={toggleMobileDrawer}>
                <ListItemIcon><School /></ListItemIcon>
                <ListItemText primary="Cursos" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={toggleMobileDrawer}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Entrar" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/registrar" onClick={toggleMobileDrawer}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Cadastrar" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Logo/Brand */}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: { xs: 1, md: 0 },
              textDecoration: 'none', 
              color: 'primary.main',
              fontWeight: 700,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              mr: { md: 4 }
            }}
          >
            Sistema de Inclusão Social
          </Typography>

          {/* Navigation - Desktop */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, ml: 2 }}>
              <Button
                component={Link}
                to="/forum"
                startIcon={<Forum />}
                sx={{ color: 'text.primary' }}
              >
                Fórum
              </Button>
              <Button
                component={Link}
                to="/usuarios"
                startIcon={<People />}
                sx={{ color: 'text.primary' }}
              >
                Usuários
              </Button>
              <Button
                component={Link}
                to="/vagas"
                startIcon={<Work />}
                sx={{ color: 'text.primary' }}
              >
                Vagas
              </Button>
              <Button
                component={Link}
                to="/cursos"
                startIcon={<School />}
                sx={{ color: 'text.primary' }}
              >
                Cursos
              </Button>
              <Button
                component={Link}
                to="/chat"
                startIcon={<Chat />}
                sx={{ color: 'text.primary' }}
              >
                Chat
              </Button>
            </Box>
          )}

          {/* User Area */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {/* User Info - Desktop */}
                {!isMobile && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mr: 2,
                      cursor: 'pointer',
                      p: 1,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                    onClick={handleProfileMenuOpen}
                  >
                    <Badge 
                      color="secondary" 
                      badgeContent={user.nivel_atual}
                      sx={{ 
                        '& .MuiBadge-badge': {
                          bgcolor: 'secondary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          minWidth: 20,
                          height: 20,
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main',
                          fontSize: '1rem',
                          border: '2px solid',
                          borderColor: 'primary.light',
                        }}
                      >
                        {user.nome.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {user.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.xp_atual} XP
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Profile Menu Button - Mobile */}
                {isMobile && (
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{
                      p: 0.5,
                    }}
                  >
                    <Badge 
                      color="secondary" 
                      badgeContent={user.nivel_atual}
                      sx={{ 
                        '& .MuiBadge-badge': {
                          bgcolor: 'secondary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          minWidth: 18,
                          height: 18,
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: 'primary.main',
                          fontSize: '0.9rem',
                          border: '2px solid',
                          borderColor: 'primary.light',
                        }}
                      >
                        {user.nome.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </IconButton>
                )}
              </>
            ) : (
              /* Login/Register - Desktop */
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to="/cursos"
                    sx={{ color: 'text.primary' }}
                  >
                    Cursos
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="small"
                  >
                    Entrar
                  </Button>
                  <Button
                    component={Link}
                    to="/registrar"
                    variant="contained"
                    size="small"
                  >
                    Cadastrar
                  </Button>
                </Box>
              )
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={toggleMobileDrawer}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu Dropdown */}
      {renderProfileMenu}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};

export default Header;