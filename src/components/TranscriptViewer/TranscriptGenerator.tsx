import {
	Box,
	Button,
	CircularProgress,
	Grid,
	Paper,
	Stack,
	Tooltip,
	Typography,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import ModelSelect from '../ModelSelect';
import LanguageSelect from '../LanguageSelect';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StopIcon from '@mui/icons-material/Stop';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Dispatch, SetStateAction } from 'react';
import { useTranscriptGenerator } from '@/hooks/useTranscriptGenerator';

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
	const {
		ai,
		clipboard,
		speech,
		export: exportActions,
		language,
		isAdmin,
	} = useTranscriptGenerator({
		selectedModel,
		formattedParagraphs,
	});

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
						<ModelSelect
							setSelectedModel={setSelectedModel}
							selectedModel={selectedModel}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<LanguageSelect
							selectedLanguage={language.selected}
							setSelectedLanguage={language.set}
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
							!isAdmin
								? 'Generowanie podsumowań jest obecnie dostępne tylko dla administratora.'
								: ''
						}
					>
						<span>
							<Button
								disabled={ai.isLoading || !isAdmin}
								variant="contained"
								size="small"
								startIcon={
									ai.isLoading ? (
										<CircularProgress sx={{ color: 'inherit' }} size={14} />
									) : (
										<SmartToyIcon sx={{ fontSize: 16 }} />
									)
								}
								onClick={ai.generate}
								sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
							>
								Generuj podsumowanie
							</Button>
						</span>
					</Tooltip>

					{isAdmin && (
						<Button
							disabled={!ai.isLoading}
							variant="contained"
							size="small"
							color="error"
							startIcon={<StopIcon sx={{ fontSize: 16 }} />}
							onClick={ai.abort}
						>
							Anuluj generowanie
						</Button>
					)}
				</Stack>
			</Stack>

			{/* AI Output Section */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{ai.isLoading ? (
					<Typography
						variant="body2"
						sx={{ color: 'text.secondary', fontStyle: 'italic' }}
					>
						Generuję odpowiedź AI...
					</Typography>
				) : ai.error ? (
					<Typography variant="body2" color="error">
						{ai.error}
					</Typography>
				) : ai.response ? (
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
								flexWrap: 'wrap',
								gap: 1,
								mb: 1.5,
								pb: 1,
								borderBottom: '1px dashed',
								borderColor: 'divider',
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 700, color: '#3b82f6' }}
							>
								Odpowiedź AI ({language.selected.toUpperCase()})
							</Typography>
							<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
								{speech.isSupported && (
									<>
										<Button
											disabled={!ai.response || ai.isLoading}
											variant={speech.isSpeaking ? 'contained' : 'outlined'}
											color={
												speech.isSpeaking && speech.isPaused
													? 'success'
													: speech.isSpeaking
														? 'warning'
														: 'primary'
											}
											size="small"
											startIcon={
												speech.isSpeaking && speech.isPaused ? (
													<PlayArrowIcon sx={{ fontSize: 16 }} />
												) : speech.isSpeaking ? (
													<PauseIcon sx={{ fontSize: 16 }} />
												) : (
													<VolumeUpIcon sx={{ fontSize: 16 }} />
												)
											}
											onClick={speech.toggle}
										>
											{speech.isSpeaking && speech.isPaused
												? 'Wznów'
												: speech.isSpeaking
													? 'Pauza'
													: 'Odsłuchaj'}
										</Button>

										{speech.isSpeaking && (
											<Button
												variant="outlined"
												color="error"
												size="small"
												startIcon={<VolumeOffIcon sx={{ fontSize: 16 }} />}
												onClick={speech.stop}
											>
												Stop
											</Button>
										)}
									</>
								)}

								<Button
									disabled={!ai.response || ai.isLoading}
									variant="outlined"
									size="small"
									startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
									onClick={exportActions.open}
								>
									Eksportuj
								</Button>
								<Menu
									anchorEl={exportActions.anchorEl}
									open={exportActions.isOpen}
									onClose={exportActions.close}
								>
									<MenuItem onClick={exportActions.txt}>
										<ListItemIcon>
											<DescriptionIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText>Pobierz jako .TXT</ListItemText>
									</MenuItem>
									<MenuItem onClick={exportActions.markdown}>
										<ListItemIcon>
											<CodeIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText>Pobierz jako .MD (Markdown)</ListItemText>
									</MenuItem>
									<MenuItem onClick={exportActions.pdf}>
										<ListItemIcon>
											<PictureAsPdfIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText>Drukuj / Pobierz PDF</ListItemText>
									</MenuItem>
								</Menu>

								<Button
									disabled={!ai.response || ai.isLoading}
									variant="contained"
									size="small"
									startIcon={
										clipboard.copied ? (
											<CheckIcon sx={{ fontSize: 16 }} />
										) : (
											<ContentCopyIcon sx={{ fontSize: 16 }} />
										)
									}
									onClick={clipboard.copy}
									sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
								>
									{clipboard.copied ? 'Skopiowano!' : 'Kopiuj podsumowanie'}
								</Button>
							</Stack>
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
							{ai.response}
						</Typography>
					</Paper>
				) : null}
			</Box>
		</Paper>
	);
}
