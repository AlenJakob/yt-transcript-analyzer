'use client';

import { useState, useMemo } from 'react';
import { Paper, Box, Typography, Grid, Snackbar, Alert, Stack, Divider } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TranscriptSegment } from '@/lib/youtube';
import { PRESETS, PromptPreset } from './AiPresets/presetsData';
import PresetCard from './AiPresets/PresetCard';
import PresetSimulation from './AiPresets/PresetSimulation';

interface AiAnalysisPresetsProps {
	segments: TranscriptSegment[];
	videoTitle: string;
}

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

			{/* Grid Szablonów Promptów */}
			<Grid container spacing={2} sx={{ mb: 4 }}>
				{PRESETS.map((preset) => (
					<PresetCard
						key={preset.id}
						preset={preset}
						isSelected={selectedPresetId === preset.id}
						onSelect={(id) => {
							setSelectedPresetId(id);
							setSimulationResult(null);
						}}
						onCopyPrompt={handleCopyPrompt}
					/>
				))}
			</Grid>

			<Divider sx={{ my: 3 }} />

			{/* Sekcja Symulacji Analizy AI */}
			<PresetSimulation
				activePreset={activePreset}
				isSimulating={isSimulating}
				simulationResult={simulationResult}
				onRunSimulation={handleRunSimulation}
			/>

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
