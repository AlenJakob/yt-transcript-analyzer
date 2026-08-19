'use client';

import { Paper, Box, Select, MenuItem, Typography } from '@mui/material';

export type Language = 'pl' | 'en' | 'de' | 'es' | 'fr';

export interface LanguageOption {
	code: Language;
	label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
	{ code: 'pl', label: '🇵🇱 Polski (pl)' },
	{ code: 'en', label: '🇬🇧 English (en)' },
	{ code: 'de', label: '🇩🇪 Deutsch (de)' },
	{ code: 'es', label: '🇪🇸 Español (es)' },
	{ code: 'fr', label: '🇫🇷 Français (fr)' },
];

interface LanguageSelectProps {
	selectedLanguage: Language;
	setSelectedLanguage: (lang: Language) => void;
}

export default function LanguageSelect({
	selectedLanguage,
	setSelectedLanguage,
}: LanguageSelectProps) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3.5 },
				height: '100%',
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 8px 32px rgba(0, 0, 0, 0.4)'
						: '0 4px 20px rgba(0, 0, 0, 0.05)',
			}}
		>
			<Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
				Język odpowiedzi AI
			</Typography>
			<Box sx={{ mb: 2 }}>
				<Select
					id="language-select-dropdown"
					size="medium"
					fullWidth
					value={selectedLanguage}
					onChange={(e) => setSelectedLanguage(e.target.value as Language)}
				>
					{SUPPORTED_LANGUAGES.map((lang) => (
						<MenuItem key={lang.code} value={lang.code}>
							{lang.label}
						</MenuItem>
					))}
				</Select>
			</Box>
		</Paper>
	);
}
