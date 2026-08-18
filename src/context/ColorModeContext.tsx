'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
	startTransition,
	ReactNode,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/theme/theme';

export type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
	mode: ColorMode;
	toggleColorMode: () => void;
	setColorMode: (mode: ColorMode) => void;
}

const STORAGE_KEY = 'yt_transcript_analyzer_theme';

const ColorModeContext = createContext<ColorModeContextType>({
	mode: 'dark',
	toggleColorMode: () => {},
	setColorMode: () => {},
});

export const useColorMode = (): ColorModeContextType => useContext(ColorModeContext);

interface ColorModeProviderProps {
	children: ReactNode;
}

export function ColorModeProvider({ children }: ColorModeProviderProps) {
	const [mode, setModeState] = useState<ColorMode>('dark');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		let initialMode: ColorMode = 'dark';
		try {
			const savedMode = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
			if (savedMode === 'light' || savedMode === 'dark') {
				initialMode = savedMode;
			} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
				initialMode = 'light';
			}
		} catch (error) {
			console.error('Failed to read theme preference from localStorage:', error);
		}

		startTransition(() => {
			setModeState(initialMode);
			setMounted(true);
		});
	}, []);

	const setColorMode = useCallback((newMode: ColorMode) => {
		setModeState(newMode);
		try {
			localStorage.setItem(STORAGE_KEY, newMode);
		} catch (error) {
			console.error('Failed to save theme preference to localStorage:', error);
		}
	}, []);

	const toggleColorMode = useCallback(() => {
		setModeState((prevMode) => {
			const nextMode: ColorMode = prevMode === 'dark' ? 'light' : 'dark';
			try {
				localStorage.setItem(STORAGE_KEY, nextMode);
			} catch (error) {
				console.error('Failed to save theme preference to localStorage:', error);
			}
			return nextMode;
		});
	}, []);

	const activeTheme = useMemo(() => getTheme(mounted ? mode : 'dark'), [mode, mounted]);

	const contextValue = useMemo(
		() => ({
			mode,
			toggleColorMode,
			setColorMode,
		}),
		[mode, toggleColorMode, setColorMode]
	);

	return (
		<ColorModeContext.Provider value={contextValue}>
			<ThemeProvider theme={activeTheme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
}
