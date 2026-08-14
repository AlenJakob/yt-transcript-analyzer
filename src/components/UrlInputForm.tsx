'use client';

import { useState, useEffect, startTransition } from 'react';
import {
	Paper,
	TextField,
	Button,
	Box,
	Typography,
	CircularProgress,
	InputAdornment,
	Alert,
	Chip,
	Stack,
	Select,
	MenuItem,
	FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import { extractYouTubeVideoId } from '@/lib/youtube';
import { getUserPreferences, saveUserPreferences } from '@/lib/storage';

interface UrlInputFormProps {
	onFetchTranscript: (url: string, preferredLanguage: 'pl' | 'en' | 'auto') => void;
	isLoading: boolean;
	error: string | null;
}

const SAMPLE_VIDEOS = [
	{ label: 'Wprowadzenie do AI', url: 'https://www.youtube.com/watch?v=aircAruvnKk' },
	{ label: 'Shorts przykładowy', url: 'https://www.youtube.com/shorts/30G51X35090' },
];

export default function UrlInputForm({ onFetchTranscript, isLoading, error }: UrlInputFormProps) {
	const [inputUrl, setInputUrl] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);
	const [preferredLanguage, setPreferredLanguage] = useState<'pl' | 'en' | 'auto'>('pl');

	// Odczytaj zapisane w localStorage preferencje użytkownika
	useEffect(() => {
		const prefs = getUserPreferences();
		if (prefs.preferredLanguage) {
			startTransition(() => {
				setPreferredLanguage(prefs.preferredLanguage);
			});
		}
	}, []);

	const handleLanguageChange = (lang: 'pl' | 'en' | 'auto') => {
		setPreferredLanguage(lang);
		saveUserPreferences({ preferredLanguage: lang });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setValidationError(null);

		const trimmed = inputUrl.trim();
		if (!trimmed) {
			setValidationError('Wprowadź link do filmu YouTube.');
			return;
		}

		const videoId = extractYouTubeVideoId(trimmed);
		if (!videoId) {
			setValidationError(
				'Nieprawidłowy format linku. Wklej link w postaci np. https://www.youtube.com/watch?v=...'
			);
			return;
		}

		onFetchTranscript(trimmed, preferredLanguage);
	};

	const handleSelectSample = (sampleUrl: string) => {
		setInputUrl(sampleUrl);
		setValidationError(null);
		onFetchTranscript(sampleUrl, preferredLanguage);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3.5 },
				mb: 4,
				background: 'linear-gradient(145deg, #121824 0%, #0e131d 100%)',
				border: '1px solid rgba(255, 255, 255, 0.08)',
				borderRadius: 4,
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
			}}
		>
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="h5"
					sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
				>
					<YouTubeIcon sx={{ color: '#ef4444', fontSize: 28 }} /> Analizuj transkrypcję z YouTube
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Wklej dowolny link z YouTube (`watch`, `youtu.be`, `shorts`), aby natychmiast wyciągnąć
					napisy i przejdź do analizy AI.
				</Typography>
			</Box>

			<form onSubmit={handleSubmit}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'stretch' }}>
					{/* Pole wprowadzania URL */}
					<TextField
						fullWidth
						placeholder="Wklej adres URL filmu (np. https://www.youtube.com/watch?v=...)"
						value={inputUrl}
						onChange={(e) => {
							setInputUrl(e.target.value);
							if (validationError) setValidationError(null);
						}}
						disabled={isLoading}
						error={Boolean(validationError)}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#9ca3af', fontSize: 22 }} />
									</InputAdornment>
								),
								endAdornment: inputUrl ? (
									<InputAdornment position="end">
										<CancelIcon
											sx={{ color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}
											onClick={() => setInputUrl('')}
										/>
									</InputAdornment>
								) : null,
							},
						}}
					/>

					{/* Wybór preferowanego języka (zapisywany w localStorage) */}
					<FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
						<Select
							id="preferred-language-select"
							value={preferredLanguage}
							onChange={(e) => handleLanguageChange(e.target.value as 'pl' | 'en' | 'auto')}
							disabled={isLoading}
							sx={{
								height: '56px',
								borderRadius: 2,
								bgcolor: 'rgba(255, 255, 255, 0.03)',
								fontWeight: 600,
								fontSize: '0.9rem',
							}}
							startAdornment={
								<InputAdornment position="start" sx={{ ml: 1, mr: 0 }}>
									<LanguageIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
								</InputAdornment>
							}
						>
							<MenuItem value="pl">🇵🇱 Polski (pl)</MenuItem>
							<MenuItem value="en">🇬🇧 Angielski (en)</MenuItem>
							<MenuItem value="auto">🌐 Domyślny (auto)</MenuItem>
						</Select>
					</FormControl>

					{/* Przycisk Pobierz tekst */}
					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={isLoading || !inputUrl.trim()}
						startIcon={
							isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />
						}
						sx={{
							minWidth: { sm: '180px' },
							height: '56px',
							fontSize: '1rem',
							bgcolor: '#3b82f6',
							'&:hover': { bgcolor: '#2563eb' },
						}}
					>
						{isLoading ? 'Pobieranie...' : 'Pobierz tekst'}
					</Button>
				</Stack>
			</form>

			{validationError && (
				<Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
					{validationError}
				</Alert>
			)}

			{error && (
				<Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			{/* Przykładowe linki */}
			<Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
					Szybki test:
				</Typography>
				{SAMPLE_VIDEOS.map((sample, idx) => (
					<Chip
						key={idx}
						label={sample.label}
						size="small"
						onClick={() => handleSelectSample(sample.url)}
						disabled={isLoading}
						clickable
						sx={{
							bgcolor: 'rgba(255, 255, 255, 0.05)',
							borderColor: 'rgba(255, 255, 255, 0.1)',
							'&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' },
						}}
					/>
				))}
			</Box>
		</Paper>
	);
}
