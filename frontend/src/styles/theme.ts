import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#4c6bae',
      light: '#6a89cc',
      dark: '#3a5599',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffa100',
      light: '#ffb638',
      dark: '#e69100',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#657396',
      light: '#8491b0',
      dark: '#4a5770',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#657396',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2c3e50',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#2c3e50',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#2c3e50',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2c3e50',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#657396',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(76, 107, 174, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 107, 174, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2c3e50',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;