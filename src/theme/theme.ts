import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0d14',
      paper: '#121824',
    },
    primary: {
      main: '#3b82f6', // Modern blue accent
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ef4444', // YouTube red accent
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#06b6d4',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.4rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.2rem',
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#9ca3af',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          padding: '8px 18px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#121824',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 14,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#0a0d14',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.25)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});

export default darkTheme;
