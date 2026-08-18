import { Box, Button, CircularProgress, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ModelSelect from '../ModelSelect';
import LanguageSelect from '../LanguageSelect';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StopIcon from '@mui/icons-material/Stop';
import CheckIcon from '@mui/icons-material/Check';
import { Dispatch, SetStateAction, useState } from 'react';
import { useCopyClipboard } from '@/hooks/useCopyClipboad';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useAuthUser } from '@/hooks/useAuthUser';

interface TranscriptGeneratorProps {
	selectedModel: string;
	setSelectedModel: Dispatch<SetStateAction<string>>;
	formattedParagraphs: string[];
}

export default function TranscriptGenerator({
	selectedModel,
	setSelectedModel,
	formattedParagraphs,
}: TranscriptGeneratorProps) {
	const [selectedLanguage, setSelectedLanguage] = useState<string>('pl');
	const { aiResponse, isAiLoading, error, generateSummary, abort } = useAiSummary();
	const { isAdmin } = useAuthUser();
	const isAllowed = isAdmin;
	const [copied, setCopied] = useState(false);
	const { copyClipBoard } = useCopyClipboard();

	const handleGenerateAiSummary = () => {
		const transcriptText = formattedParagraphs.join('\n\n');
		setCopied(false);
		generateSummary(transcriptText, selectedModel, undefined, selectedLanguage);
	};

	const handleCopy = () => {
		if (aiResponse) {
			copyClipBoard(aiResponse);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 2,
				p: { xs: 3, sm: 4 },
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
			}}
		>
			<Typography
				variant="h3"
				sx={{
					lineHeight: 1.85,
					letterSpacing: '0.015em',
					color: 'text.primary',
					fontSize: '1.1rem',
					mb: '16px',
				}}
			>
				Generowanie podsumowania AI
			</Typography>

			<Stack spacing={2.5} sx={{ mb: 3 }}>
				{/* Controls: Model Select & Language Select */}
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<ModelSelect setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<LanguageSelect
							selectedLanguage={selectedLanguage}
							setSelectedLanguage={setSelectedLanguage}
						/>
					</Grid>
				</Grid>

				{/* Action Buttons */}
				<Stack
					direction="row"
					spacing={1.5}
					sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
				>
					<Tooltip
						title={
							!isAllowed
								? 'Generowanie podsumowań jest obecnie dostępne tylko dla administratora.'
								: ''
						}
					>
						<span>
							<Button
								disabled={isAiLoading || !isAllowed}
								variant="contained"
								size="small"
								startIcon={
									isAiLoading ? (
										<CircularProgress sx={{ color: 'inherit' }} size={14} />
									) : (
										<SmartToyIcon sx={{ fontSize: 16 }} />
									)
								}
								onClick={handleGenerateAiSummary}
								sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
							>
								Generuj podsumowanie
							</Button>
						</span>
					</Tooltip>

					{isAllowed && (
						<Button
							disabled={!isAiLoading}
							variant="contained"
							size="small"
							color="error"
							startIcon={<StopIcon sx={{ fontSize: 16 }} />}
							onClick={abort}
						>
							Anuluj generowanie
						</Button>
					)}
				</Stack>
			</Stack>

			{/* AI Output Section */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{isAiLoading ? (
					<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
						Generuję odpowiedź AI...
					</Typography>
				) : error ? (
					<Typography variant="body2" color="error">
						{error}
					</Typography>
				) : aiResponse ? (
					<Paper
						elevation={0}
						sx={{
							p: 2.5,
							bgcolor: (theme) =>
								theme.palette.mode === 'dark'
									? 'rgba(59, 130, 246, 0.05)'
									: 'rgba(59, 130, 246, 0.03)',
							border: '1px solid',
							borderColor: (theme) =>
								theme.palette.mode === 'dark'
									? 'rgba(59, 130, 246, 0.2)'
									: 'rgba(59, 130, 246, 0.15)',
							borderRadius: 2,
						}}
					>
						<Stack
							direction="row"
							sx={{
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 1.5,
								pb: 1,
								borderBottom: '1px dashed',
								borderColor: 'divider',
							}}
						>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3b82f6' }}>
								Odpowiedź AI ({selectedLanguage.toUpperCase()})
							</Typography>
							<Button
								disabled={!aiResponse || isAiLoading}
								variant="contained"
								size="small"
								startIcon={
									copied ? (
										<CheckIcon sx={{ fontSize: 16 }} />
									) : (
										<ContentCopyIcon sx={{ fontSize: 16 }} />
									)
								}
								onClick={handleCopy}
								sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
							>
								{copied ? 'Skopiowano!' : 'Kopiuj podsumowanie'}
							</Button>
						</Stack>
						<Typography
							variant="body1"
							sx={{
								lineHeight: 1.85,
								letterSpacing: '0.015em',
								color: 'text.primary',
								whiteSpace: 'pre-line',
							}}
						>
							{aiResponse}
						</Typography>
					</Paper>
				) : null}
			</Box>
		</Paper>
	);
}

