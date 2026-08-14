'use client';

import { useState, useMemo } from 'react';
import {
	Box,
	Paper,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	TextField,
	InputAdornment,
	Button,
	ButtonGroup,
	Grid,
	Card,
	CardContent,
	Chip,
	IconButton,
	Tooltip,
	Snackbar,
	Alert,
	Stack,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import {
	TranscriptSegment,
	groupTranscriptSegments,
	formatContinuousParagraphs,
} from '@/lib/youtube';
import TranscriptGenerator from './TranscriptGenerator';

interface TranscriptViewerProps {
	segments: TranscriptSegment[];
	videoId: string;
}

export default function TranscriptViewer({ segments, videoId }: TranscriptViewerProps) {
	const [viewMode, setViewMode] = useState<'timestamps' | 'continuous'>('continuous');
	const [groupInterval, setGroupInterval] = useState<number>(30);
	const [searchQuery, setSearchQuery] = useState('');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
	const [selectedModel, setSelectedModel] = useState<string>('');

	const processedSegments = useMemo(() => {
		if (groupInterval === 0) {
			return segments;
		}
		return groupTranscriptSegments(segments, groupInterval);
	}, [segments, groupInterval]);

	const filteredSegments = useMemo(() => {
		if (!searchQuery.trim()) {
			return processedSegments;
		}
		const query = searchQuery.toLowerCase();
		return processedSegments.filter((segment) => segment.text.toLowerCase().includes(query));
	}, [processedSegments, searchQuery]);

	const formattedParagraphs = useMemo((): string[] => {
		return formatContinuousParagraphs(segments);
	}, [segments]);

	const handleCopySingleBlock = (item: TranscriptSegment) => {
		navigator.clipboard.writeText(`[${item.timestamp}] ${item.text}`);
		setSnackbarMessage(`Skopiowano fragment [${item.timestamp}]!`);
	};

	const handleCopyText = (includeTimestamps: boolean) => {
		const content = includeTimestamps
			? processedSegments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n\n')
			: formattedParagraphs.join('\n\n');
		navigator.clipboard.writeText(content);
		setSnackbarMessage(
			includeTimestamps
				? 'Skopiowano ustrukturyzowany tekst z czasówkami!'
				: 'Skopiowano tekst ciągły (akapity)!'
		);
	};

	const handleExport = (format: 'txt' | 'md' | 'json') => {
		const fileName = `transkrypcja_${videoId}.${format}`;
		let fileContent = '';
		let mimeType = 'text/plain;charset=utf-8';

		if (format === 'txt') {
			fileContent = processedSegments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n\n');
		} else if (format === 'md') {
			fileContent =
				`# Transkrypcja YouTube (${videoId})\n\n` +
				processedSegments.map((s) => `### [${s.timestamp}]\n${s.text}`).join('\n\n');
		} else if (format === 'json') {
			fileContent = JSON.stringify(processedSegments, null, 2);
			mimeType = 'application/json;charset=utf-8';
		}

		const blob = new Blob([fileContent], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		setSnackbarMessage(`Pobrano plik ${fileName}!`);
	};

	return (
		<Box sx={{ mb: 5 }}>
			{/* Pasek narzędziowy */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2.5,
					display: 'flex',
					flexDirection: { xs: 'column', xl: 'row' },
					gap: 2,
					alignItems: { xs: 'stretch', xl: 'center' },
					justifyContent: 'space-between',
					bgcolor: '#121824',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					borderRadius: 3,
				}}
			>
				{/* Przełącznik widoków + grupowanie */}
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center' }}>
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_, newMode) => newMode && setViewMode(newMode)}
						size="small"
						sx={{
							bgcolor: 'rgba(255, 255, 255, 0.04)',
							p: 0.5,
							borderRadius: 2,
							'& .MuiToggleButton-root': {
								border: 0,
								borderRadius: 1.5,
								px: 2,
								py: 0.75,
								color: 'text.secondary',
								fontWeight: 600,
								'&.Mui-selected': {
									bgcolor: '#3b82f6',
									color: '#ffffff',
									'&:hover': { bgcolor: '#2563eb' },
								},
							},
						}}
					>
						<ToggleButton value="timestamps">
							<AccessTimeIcon sx={{ fontSize: 18, mr: 0.75 }} /> Czasówki
						</ToggleButton>
						<ToggleButton value="continuous">
							<NotesIcon sx={{ fontSize: 18, mr: 0.75 }} /> Tekst Ciągły
						</ToggleButton>
					</ToggleButtonGroup>

					{viewMode === 'timestamps' && (
						<FormControl size="small" sx={{ minWidth: 170 }}>
							<InputLabel
								id="group-interval-label"
								sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
							>
								Łączenie czanków
							</InputLabel>
							<Select
								labelId="group-interval-label"
								value={groupInterval}
								label="Łączenie czanków"
								onChange={(e) => setGroupInterval(Number(e.target.value))}
								sx={{
									borderRadius: 2,
									bgcolor: 'rgba(255, 255, 255, 0.03)',
									fontSize: '0.85rem',
									fontWeight: 600,
								}}
							>
								<MenuItem value={30}>Co ~30 sek (Czytelne akapity)</MenuItem>
								<MenuItem value={60}>Co ~60 sek (Duże bloki)</MenuItem>
								<MenuItem value={0}>Oryginalne (Drobne czanki)</MenuItem>
							</Select>
						</FormControl>
					)}
				</Stack>

				{/* Wyszukiwarka */}
				<TextField
					size="small"
					placeholder="Szukaj frazy w tekście..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{ minWidth: { sm: 200, lg: 220 } }}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
								</InputAdornment>
							),
						},
					}}
				/>

				{/* Sekcja Akcji: Kopiowanie & Eksport */}
				<Stack
					direction="row"
					spacing={1.5}
					sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
				>
					{/* Grupa Kopiowania */}
					<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
						<Tooltip title="Kopiuj sam tekst w sformatowanych akapitach">
							<Button
								variant="contained"
								size="small"
								startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
								onClick={() => handleCopyText(false)}
								sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, whiteSpace: 'nowrap' }}
							>
								Kopiuj tekst
							</Button>
						</Tooltip>

						<Tooltip title="Kopiuj akapity wraz ze znacznikami czasu">
							<Button
								variant="outlined"
								size="small"
								startIcon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
								onClick={() => handleCopyText(true)}
								sx={{
									borderColor: 'rgba(59, 130, 246, 0.4)',
									color: '#60a5fa',
									whiteSpace: 'nowrap',
								}}
							>
								Z czasówkami
							</Button>
						</Tooltip>
					</Stack>

					{/* Grupa Eksportu do pliku */}
					<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
						<ButtonGroup
							variant="outlined"
							size="small"
							sx={{
								borderColor: 'rgba(255, 255, 255, 0.15)',
								'& .MuiButton-root': {
									borderColor: 'rgba(255, 255, 255, 0.15)',
									color: 'text.primary',
									px: 1.5,
									py: 0.5,
									fontWeight: 600,
									fontSize: '0.8rem',
									'&:hover': {
										bgcolor: 'rgba(255, 255, 255, 0.06)',
										borderColor: 'rgba(255, 255, 255, 0.3)',
									},
								},
							}}
						>
							<Tooltip title="Pobierz plik tekstowy .txt">
								<Button
									startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
									onClick={() => handleExport('txt')}
								>
									.txt
								</Button>
							</Tooltip>
							<Tooltip title="Pobierz plik Markdown .md">
								<Button onClick={() => handleExport('md')}>.md</Button>
							</Tooltip>
							<Tooltip title="Pobierz plik JSON .json">
								<Button onClick={() => handleExport('json')}>.json</Button>
							</Tooltip>
						</ButtonGroup>
					</Stack>
				</Stack>
			</Paper>

			{/* Info o złączonych czankach */}
			{viewMode === 'timestamps' && groupInterval > 0 && (
				<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
					<Chip
						icon={<ViewStreamIcon sx={{ fontSize: 15, color: '#3b82f6 !important' }} />}
						label={`Złączono ${segments.length} drobnych czanków w ${processedSegments.length} czytelnych bloków tekstu (co ~${groupInterval}s)`}
						size="small"
						sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 600, py: 0.5 }}
					/>
				</Box>
			)}

			{/* Info o wynikach wyszukiwania */}
			{searchQuery && (
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary', display: 'block', mb: 2, ml: 1 }}
				>
					Znaleziono {filteredSegments.length} bloków tekstu zawierających &quot;{searchQuery}&quot;
				</Typography>
			)}

			<TranscriptGenerator
				selectedModel={selectedModel}
				setSelectedModel={setSelectedModel}
				formattedParagraphs={formattedParagraphs}
			/>

			{/* WIDOK 1: CZASÓWKI */}
			{viewMode === 'timestamps' && (
				<Grid container spacing={2}>
					{filteredSegments.map((item, idx) => {
						const timestampUrl = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(item.offset)}`;
						return (
							<Grid size={{ xs: 12, md: groupInterval > 0 ? 6 : 4 }} key={idx}>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										transition: 'transform 0.15s ease-in-out, border-color 0.15s ease-in-out',
										'&:hover': {
											transform: 'translateY(-2px)',
											borderColor: 'rgba(59, 130, 246, 0.4)',
										},
									}}
								>
									<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
										<Stack
											direction="row"
											spacing={1}
											sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
										>
											<Chip
												icon={<AccessTimeIcon sx={{ fontSize: 14, color: '#60a5fa !important' }} />}
												label={item.timestamp}
												size="small"
												sx={{
													bgcolor: 'rgba(59, 130, 246, 0.12)',
													color: '#60a5fa',
													fontWeight: 700,
													fontSize: '0.8rem',
												}}
											/>
											<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
												<Tooltip title="Kopiuj ten fragment do schowka">
													<IconButton
														size="small"
														onClick={() => handleCopySingleBlock(item)}
														sx={{ color: 'text.secondary', '&:hover': { color: '#3b82f6' } }}
													>
														<ContentCopyIcon sx={{ fontSize: 15 }} />
													</IconButton>
												</Tooltip>
												<Tooltip title="Otwórz film w tym momencie na YouTube">
													<IconButton
														size="small"
														component="a"
														href={timestampUrl}
														target="_blank"
														rel="noopener noreferrer"
														sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
													>
														<OpenInNewIcon sx={{ fontSize: 16 }} />
													</IconButton>
												</Tooltip>
											</Stack>
										</Stack>
										<Typography
											variant="body2"
											sx={{ color: 'text.primary', lineHeight: 1.6, letterSpacing: '0.01em' }}
										>
											{item.text}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			)}

			{/* WIDOK 2: TEKST CIĄGŁY W AKAPITACH */}
			{viewMode === 'continuous' && (
				<Paper
					elevation={0}
					sx={{
						p: { xs: 3, sm: 4 },
						bgcolor: '#121824',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 3,
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						sx={{
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
							pb: 2,
							borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
						}}
					>
						<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
							Pełny tekst wideo (sformatowane akapity)
						</Typography>

						<Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
							<Button
								variant="contained"
								size="small"
								startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
								onClick={() => handleCopyText(false)}
								sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
							>
								Kopiuj całą transkrypcję
							</Button>
						</Stack>
					</Stack>

					<Box
						sx={{
							maxHeight: 450,
							overflowY: 'auto',
							overflowX: 'hidden',
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							pr: 1.5,
						}}
					>
						{formattedParagraphs.map((para, idx) => (
							<Typography
								key={idx}
								variant="body1"
								sx={{
									lineHeight: 1.85,
									letterSpacing: '0.015em',
									color: 'text.primary',
								}}
							>
								{para}
							</Typography>
						))}
					</Box>
				</Paper>
			)}

			<Snackbar
				open={Boolean(snackbarMessage)}
				autoHideDuration={3000}
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
		</Box>
	);
}
