'use client';

import { Box, Typography, Button, Chip, Stack, CircularProgress } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { PromptPreset } from './presetsData';

interface PresetSimulationProps {
	activePreset: PromptPreset;
	isSimulating: boolean;
	simulationResult: string | null;
	onRunSimulation: (preset: PromptPreset) => void;
}

export default function PresetSimulation({
	activePreset,
	isSimulating,
	simulationResult,
	onRunSimulation,
}: PresetSimulationProps) {
	return (
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
					onClick={() => onRunSimulation(activePreset)}
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
	);
}
