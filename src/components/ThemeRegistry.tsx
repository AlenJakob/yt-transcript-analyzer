'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ColorModeProvider } from '@/context/ColorModeContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
	return (
		<AppRouterCacheProvider options={{ key: 'css' }}>
			<ColorModeProvider>{children}</ColorModeProvider>
		</AppRouterCacheProvider>
	);
}
