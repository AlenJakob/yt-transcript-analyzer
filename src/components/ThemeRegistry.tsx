'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from '@/theme/theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
}
