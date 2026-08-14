'use client';

import { useState, useMemo } from 'react';
import {
	Paper,
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	Chip,
	Snackbar,
	Alert,
	Stack,
	Divider,
	CircularProgress,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GppBadIcon from '@mui/icons-material/GppBad';
import SchoolIcon from '@mui/icons-material/School';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { TranscriptSegment } from '@/lib/youtube';

interface AiAnalysisPresetsProps {
	segments: TranscriptSegment[];
	videoTitle: string;
}

interface PromptPreset {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	buildPrompt: (transcriptText: string, title: string) => string;
	simulatedOutput: (transcriptText: string, title: string) => string;
}

const PRESETS: PromptPreset[] = [
	{
		id: 'tldr',
		title: 'TL;DR - Szybkie Podsumowanie',
		description:
			'Generuje zwięzłe podsumowanie w 3-5 kluczowych zdaniach z najważniejszym wnioskiem.',
		icon: <AutoAwesomeIcon sx={{ color: '#3b82f6' }} />,
		color: '#3b82f6',
		buildPrompt: (text, title) =>
			`Przeanalizuj poniższą transkrypcję filmu "${title}". Przygotuj zwięzłe podsumowanie w stylu TL;DR:\n` +
			`1. Główne przesłanie filmu (1 zdanie)\n` +
			`2. 3 najważniejsze wnioski w punktach\n` +
			`3. Dla kogo ten materiał jest najbardziej wartościowy\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`📌 **TL;DR dla filmu: "${title}"**\n\n` +
			`• **Główne przesłanie:** Materiał przedstawia kluczowe strategie oraz praktyczne wskazówki dotyczące efektywnej pracy z nowoczesnymi technologiami i narzędziami AI.\n\n` +
			`• **Kluczowe wnioski:**\n` +
			`  1. Automatyzacja powtarzalnych procesów pozwala zaoszczędzić do 40% czasu dziennie.\n` +
			`  2. Zrozumienie fundamentów jest ważniejsze niż testowanie dziesiątek powierzchownych narzędzi.\n` +
			`  3. Systematyczna weryfikacja i podsumowywanie wiedzy znacząco zwiększa retencję informacji.\n\n` +
			`💡 **Dla kogo:** Praktycy, twórcy i inżynierowie szukający konkretnych, sprawdzonych rozwiązań bez zbędnego lania wody.`,
	},
	{
		id: 'notes',
		title: 'Strukturyzowane Notatki',
		description: 'Tworzy przejrzyste notatki podzielone na sekcje, zagadnienia i definicje.',
		icon: <FormatListNumberedIcon sx={{ color: '#10b981' }} />,
		color: '#10b981',
		buildPrompt: (text, title) =>
			`Stwórz ustrukturyzowane notatki z transkrypcji filmu "${title}":\n` +
			`- Podziel treść na logiczne sekcje z nagłówkami\n` +
			`- Wyciągnij wypunktowane definicje i pojęcia\n` +
			`- Zapisz zalecane kroki akcji (Actionable Items)\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`📝 **Strukturyzowane Notatki: "${title}"**\n\n` +
			`### 1. Wprowadzenie i Kontekst\n` +
			`- Autor omawia kluczowe wyzwania występujące w przetwarzaniu dużych wolumenów danych i informacji.\n` +
			`- Zwrócono uwagę na potrzebę strukturacji nieustrukturyzowanego tekstu.\n\n` +
			`### 2. Główne Pojęcia i Definicje\n` +
			`- **Prompt Engineering:** Sztuka precyzyjnego formułowania zapytań dla modeli językowych.\n` +
			`- **Context Window:** Maksymalny rozmiar tekstu, jaki model może przeanalizować w jednym zapytaniu.\n\n` +
			`### 3. Lista Działań (Action Items)\n` +
			`- [ ] Przetestować szablony promptów na własnych danych.\n` +
			`- [ ] Zaimplementować automatyczny export notatek do formatu Markdown.`,
	},
	{
		id: 'factcheck',
		title: 'Fact Check & Weryfikacja',
		description: 'Wyciąga z tekstu twierdzenia, dane liczbowe i hipotezy do weryfikacji.',
		icon: <AssignmentTurnedInIcon sx={{ color: '#06b6d4' }} />,
		color: '#06b6d4',
		buildPrompt: (text, title) =>
			`Przeanalizuj transkrypcję filmu "${title}" pod kątem faktów i statystyk:\n` +
			`1. Wyciągnij wszystkie podane statystyki, liczby i daty\n` +
			`2. Wskaż subiektywne opinie autora w przeciwieństwie do obiektywnych faktów\n` +
			`3. Wskarz twierdzenia wymagające dodatkowej weryfikacji ze źródeł zewnętrznych\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🔍 **Weryfikacja Faktów (Fact Check) dla "${title}"**\n\n` +
			`✔️ **Przedstawione Fakty i Dane:**\n` +
			`- Wypowiedzi odnoszą się do udokumentowanych statystyk branżowych.\n` +
			`- Zastosowane wskaźniki procentowe są spójne z oficjalnymi raportami.\n\n` +
			`❓ **Opinie i Hipotezy (Wymagają Uwagi):**\n` +
			`- Twierdzenie o "10x szybszym rozwoju" ma charakter hiperboli retorycznej i zaleca się ostrożność.\n` +
			`- Zapisane prognozy na przyszły rok stanowią estymację autora, a nie potwierdzony fakt.`,
	},
	{
		id: 'scam',
		title: 'Wykrywanie Manipulacji & Scamu',
		description:
			'Analizuje język pod kątem technik erystycznych, FOMO, obietnic bez pokrycia i manipulacji.',
		icon: <GppBadIcon sx={{ color: '#ef4444' }} />,
		color: '#ef4444',
		buildPrompt: (text, title) =>
			`Przeanalizuj transkrypcję "${title}" pod kątem rzetelności oraz wykrywania manipulacji i chwytów marketingowych:\n` +
			`- Czy autor używa językowych wyzwalaczy emocjonalnych (FOMO, pilność)?\n` +
			`- Czy składane są nierrealne obietnice (np. szybki zysk, natychmiastowe rezultaty)?\n` +
			`- Oceń ogólny poziom wiarygodności w skali 1-10 z uzasadnieniem.\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🛡️ **Ocena Wiarygodności & Manipulacji: "${title}"**\n\n` +
			`📊 **Ogólna Wiarygodność:** **8.5 / 10** (Wysoka rzetelność)\n\n` +
			`🟢 **Pozytywne wskaźniki:**\n` +
			`- Brak agresywnych wezwań do natychmiastowego zakupu płatnych kursów.\n` +
			`- Autor otwarcie mówi o ograniczeniach i potencjalnych ryzykach.\n\n` +
			`🟡 **Zauważone techniki perswazji:**\n` +
			`- Subtelne budowanie autorytetu poprzez powoływanie się na własne wieloletnie doświadczenie.\n` +
			`- Użycie chwytliwych nagłówków sekcji dla zwiększenia retencji uwagi.`,
	},
	{
		id: 'learning',
		title: 'Tryb Nauki & Quiz Q&A',
		description: 'Tworzy 5 pytań testowych z odpowiedziami oraz zestaw fiszek do nauki.',
		icon: <SchoolIcon sx={{ color: '#f59e0b' }} />,
		color: '#f59e0b',
		buildPrompt: (text, title) =>
			`Na podstawie transkrypcji "${title}" stwórz materiał edukacyjny:\n` +
			`1. 5 pytań sprawdzających wiedzę (Quiz Q&A) wraz z pełnymi odpowiedziami\n` +
			`2. 3 fiszki (Pojęcie -> Wyjaśnienie)\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🎓 **Tryb Nauki & Quiz dla "${title}"**\n\n` +
			`❓ **Pytanie 1:** Jaki jest główny cel opisywanej metody?\n` +
			`➔ **Odpowiedź:** Cel stanowi przyspieszenie analizy i wyciąganie najważniejszych wniosków bez konieczności spędzania godzin na oglądaniu całego wideo.\n\n` +
			`❓ **Pytanie 2:** Jakie narzędzie pozwala na szybkie kopiowanie gotowych szablonów?\n` +
			`➔ **Odpowiedź:** Dedykowany moduł AI Prompt Presets zawarty w aplikacji YT Transcript Analyzer.\n\n` +
			`🏷️ **Fiszki do powtórzenia:**\n` +
			`• **Fiszka 1:** Transkrypcja ➔ Tekstowe odwzorowanie ścieżki dźwiękowej filmu.\n` +
			`• **Fiszka 2:** Prompt ➔ Instrukcja przekazywana modelowi sztucznej inteligencji.`,
	},
];

export default function AiAnalysisPresets({ segments, videoTitle }: AiAnalysisPresetsProps) {
	const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
	const [isSimulating, setIsSimulating] = useState<boolean>(false);
	const [simulationResult, setSimulationResult] = useState<string | null>(null);
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const fullText = useMemo(() => segments.map((s) => s.text).join(' '), [segments]);

	const activePreset = useMemo(
		() => PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0],
		[selectedPresetId]
	);

	const handleCopyPrompt = (preset: PromptPreset) => {
		const promptText = preset.buildPrompt(fullText, videoTitle);
		navigator.clipboard.writeText(promptText);
		setSnackbarMessage(`Skopiowano kompletny prompt "${preset.title}" wraz z transkrypcją!`);
	};

	const handleRunSimulation = (preset: PromptPreset) => {
		setIsSimulating(true);
		setSimulationResult(null);
		setTimeout(() => {
			setSimulationResult(preset.simulatedOutput(fullText, videoTitle));
			setIsSimulating(false);
		}, 600);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3.5 },
				mb: 6,
				bgcolor: '#121824',
				border: '1px solid rgba(255, 255, 255, 0.08)',
				borderRadius: 2,
			}}
		>
			<Box sx={{ mb: 3 }}>
				<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
					<Box
						sx={{
							p: 1,
							borderRadius: 2,
							bgcolor: 'rgba(59, 130, 246, 0.15)',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<SmartToyIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 700 }}>
						Szablony Promptów AI & Analiza
					</Typography>
				</Stack>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Wybierz gotowy szablon zapytania, skopiuj go jednym kliknięciem (z automatycznie dołączoną
					transkrypcją) lub przetestuj symulację analizy bezpośrednio tutaj.
				</Typography>
			</Box>

			{/* Grid Szablonów Promptów - Używa MUI Grid size */}
			<Grid container spacing={2} sx={{ mb: 4 }}>
				{PRESETS.map((preset) => {
					const isSelected = selectedPresetId === preset.id;
					return (
						<Grid size={{ xs: 12, sm: 6, md: 4 }} key={preset.id}>
							<Card
								onClick={() => {
									setSelectedPresetId(preset.id);
									setSimulationResult(null);
								}}
								sx={{
									height: '100%',
									cursor: 'pointer',
									borderColor: isSelected ? preset.color : 'rgba(255, 255, 255, 0.08)',
									borderWidth: isSelected ? '2px' : '1px',
									bgcolor: isSelected ? 'rgba(255, 255, 255, 0.03)' : '#121824',
									transition: 'all 0.2s ease',
									'&:hover': {
										borderColor: preset.color,
										transform: 'translateY(-2px)',
									},
								}}
							>
								<CardContent
									sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}
								>
									<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
										{preset.icon}
										<Typography
											variant="subtitle1"
											sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}
										>
											{preset.title}
										</Typography>
									</Stack>
									<Typography
										variant="body2"
										sx={{ color: 'text.secondary', fontSize: '0.85rem', flexGrow: 1, mb: 2 }}
									>
										{preset.description}
									</Typography>
									<Button
										variant={isSelected ? 'contained' : 'outlined'}
										size="small"
										startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
										onClick={(e) => {
											e.stopPropagation();
											handleCopyPrompt(preset);
										}}
										sx={{
											bgcolor: isSelected ? preset.color : 'transparent',
											borderColor: preset.color,
											color: isSelected ? '#ffffff' : preset.color,
											'&:hover': {
												bgcolor: preset.color,
												color: '#ffffff',
											},
										}}
									>
										Kopiuj Prompt
									</Button>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>

			<Divider sx={{ my: 3 }} />

			{/* Sekcja Symulacji Analizy AI dla wybranego szablonu */}
			<Box
				sx={{
					bgcolor: '#0a0d14',
					p: 3,
					borderRadius: 2,
					border: '1px solid rgba(255, 255, 255, 0.06)',
				}}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
					sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5 }}
				>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
						>
							Podgląd analizy dla:{' '}
							<Chip
								label={activePreset.title}
								size="small"
								sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', fontWeight: 600 }}
							/>
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							Uruchom symulację, aby zobaczyć przykładowy wynik analizy dla obecnego filmu.
						</Typography>
					</Box>
					<Button
						variant="contained"
						startIcon={
							isSimulating ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />
						}
						onClick={() => handleRunSimulation(activePreset)}
						disabled={isSimulating}
						sx={{ bgcolor: activePreset.color, '&:hover': { filter: 'brightness(0.9)' } }}
					>
						{isSimulating ? 'Generowanie...' : 'Generuj Symulację AI'}
					</Button>
				</Stack>

				{simulationResult ? (
					<Box
						sx={{
							p: 2.5,
							bgcolor: '#121824',
							borderRadius: 2,
							border: '1px dashed rgba(255, 255, 255, 0.15)',
						}}
					>
						<Typography
							variant="body2"
							sx={{
								whiteSpace: 'pre-line',
								lineHeight: 1.7,
								fontFamily: 'monospace',
								color: 'text.primary',
							}}
						>
							{simulationResult}
						</Typography>
					</Box>
				) : (
					<Box
						sx={{
							py: 4,
							textAlign: 'center',
							color: 'text.disabled',
							border: '1px dashed rgba(255, 255, 255, 0.08)',
							borderRadius: 2,
						}}
					>
						<SmartToyIcon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
						<Typography variant="body2">
							Kliknij <strong>&quot;Generuj Symulację AI&quot;</strong>, aby zobaczyć jak
							wyglądałaby analiza ChatGPT / Claude dla tego filmu.
						</Typography>
					</Box>
				)}
			</Box>

			<Snackbar
				open={Boolean(snackbarMessage)}
				autoHideDuration={3500}
				onClose={() => setSnackbarMessage(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity="success"
					icon={<CheckCircleIcon fontSize="small" />}
					sx={{ width: '100%', borderRadius: 2 }}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</Paper>
	);
}
