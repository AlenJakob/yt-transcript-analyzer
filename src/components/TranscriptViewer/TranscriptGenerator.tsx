import { Box, Button, CircularProgress, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ModelSelect from '../ModelSelect';
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
	const { aiResponse, isAiLoading, error, generateSummary, abort } = useAiSummary();
	const { isAdmin } = useAuthUser();
	const isAllowed = isAdmin;
	const [copied, setCopied] = useState(false);
	const { copyClipBoard } = useCopyClipboard();

	const handleGenerateAiSummary = () => {
		const transcriptText = formattedParagraphs.join('\n\n');
		setCopied(false);
		generateSummary(transcriptText, selectedModel);
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
				bgcolor: '#121824',
				border: '1px solid rgba(255, 255, 255, 0.08)',
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
					mb: '8px',
				}}
			>
				Generowanie podsumowania
			</Typography>
			<Stack spacing={2} sx={{ mb: 2 }}>
				<ModelSelect setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
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
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography
					variant="body1"
					component="div"
					sx={{
						lineHeight: 1.85,
						letterSpacing: '0.015em',
						color: 'text.primary',
						fontSize: '1.1rem',
					}}
				>
					{isAiLoading ? (
						<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
							Generuję odpowiedź AI...
						</Typography>
					) : error ? (
						<Typography variant="body2" color="error">
							{error}
						</Typography>
					) : aiResponse ? (
						<>
							<b>Odpowiedź AI:</b> <br /> {aiResponse}
						</>
					) : null}
				</Typography>
			</Box>
		</Paper>
	);
}
