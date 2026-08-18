import { createTheme, Theme } from '@mui/material/styles';

export const darkTheme: Theme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#0a0d14',
			paper: '#121824',
		},
		primary: {
			main: '#3b82f6',
			light: '#60a5fa',
			dark: '#2563eb',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#a855f7',
			light: '#c084fc',
			dark: '#7e22ce',
			contrastText: '#ffffff',
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
		fontFamily:
			'var(--font-geist-sans), "Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
		borderRadius: 8,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
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
					borderRadius: 12,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					borderRadius: 12,
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: 8,
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
		MuiCssBaseline: {
			styleOverrides: {
				'*::-webkit-scrollbar': {
					width: '8px',
					height: '8px',
				},
				'*::-webkit-scrollbar-track': {
					backgroundColor: 'rgba(255, 255, 255, 0.05)',
					borderRadius: 4,
				},
				'*::-webkit-scrollbar-thumb': {
					backgroundColor: 'rgba(59, 130, 246, 0.5)',
					borderRadius: 4,
					'&:hover': {
						backgroundColor: '#3b82f6',
					},
				},
				'*': {
					scrollbarWidth: 'thin',
					scrollbarColor: '#3b82f6 rgba(255, 255, 255, 0.05)',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 500,
					borderRadius: 6,
				},
			},
		},
	},
});

export const lightTheme: Theme = createTheme({
	palette: {
		mode: 'light',
		background: {
			default: '#f8fafc',
			paper: '#ffffff',
		},
		primary: {
			main: '#2563eb',
			light: '#3b82f6',
			dark: '#1d4ed8',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#7e22ce',
			light: '#9333ea',
			dark: '#581c87',
			contrastText: '#ffffff',
		},
		info: {
			main: '#0891b2',
		},
		success: {
			main: '#059669',
		},
		warning: {
			main: '#d97706',
		},
		text: {
			primary: '#0f172a',
			secondary: '#475569',
		},
		divider: 'rgba(0, 0, 0, 0.08)',
	},
	typography: {
		fontFamily:
			'var(--font-geist-sans), "Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
			color: '#475569',
		},
		button: {
			textTransform: 'none',
			fontWeight: 600,
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
					boxShadow: 'none',
					padding: '8px 18px',
					'&:hover': {
						boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#ffffff',
					border: '1px solid rgba(0, 0, 0, 0.08)',
					borderRadius: 12,
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					borderRadius: 12,
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: 8,
						backgroundColor: '#ffffff',
						'& fieldset': {
							borderColor: 'rgba(0, 0, 0, 0.15)',
						},
						'&:hover fieldset': {
							borderColor: 'rgba(0, 0, 0, 0.3)',
						},
						'&.Mui-focused fieldset': {
							borderColor: '#2563eb',
						},
					},
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				'*::-webkit-scrollbar': {
					width: '8px',
					height: '8px',
				},
				'*::-webkit-scrollbar-track': {
					backgroundColor: 'rgba(0, 0, 0, 0.04)',
					borderRadius: 4,
				},
				'*::-webkit-scrollbar-thumb': {
					backgroundColor: 'rgba(37, 99, 235, 0.35)',
					borderRadius: 4,
					'&:hover': {
						backgroundColor: '#2563eb',
					},
				},
				'*': {
					scrollbarWidth: 'thin',
					scrollbarColor: '#2563eb rgba(0, 0, 0, 0.04)',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 500,
					borderRadius: 6,
				},
			},
		},
	},
});

export function getTheme(mode: 'light' | 'dark'): Theme {
	return mode === 'light' ? lightTheme : darkTheme;
}

export default darkTheme;
