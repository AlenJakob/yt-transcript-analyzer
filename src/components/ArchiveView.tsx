'use client';

import { useState, useMemo, useEffect } from 'react';
import {
	Paper,
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	Chip,
	IconButton,
	Tooltip,
	TextField,
	InputAdornment,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Pagination,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { HistoryItem } from '@/lib/storage';

interface ArchiveViewProps {
	history: HistoryItem[];
	onSelectHistoryItem: (item: HistoryItem) => void;
	onDeleteItem: (videoId: string) => void;
	onClearHistory: () => void;
}

const ITEMS_PER_PAGE = 12;

export default function ArchiveView({
	history,
	onSelectHistoryItem,
	onDeleteItem,
	onClearHistory,
}: ArchiveViewProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [confirmClearOpen, setConfirmClearOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	useEffect(() => {
		const start = performance.now();
		console.log(
			`[ArchiveView Perf] Zamontowano widok Archiwum (${history.length} rekordów w pamięci).`
		);
		return () => {
			const end = performance.now();
			console.log(
				`[ArchiveView Perf] Odmontowano widok Archiwum po ${(end - start).toFixed(2)} ms.`
			);
		};
	}, [history.length]);

	// Reset strony przy zmianie zapytania wyszukiwania
	useEffect(() => {
		setPage(1);
	}, [searchQuery]);

	// Filtrowanie zmontowanej historii po tytule lub autorze
	const filteredHistory = useMemo(() => {
		if (!searchQuery.trim()) return history;
		const query = searchQuery.toLowerCase();
		return history.filter(
			(item) =>
				item.metadata.title.toLowerCase().includes(query) ||
				item.metadata.authorName.toLowerCase().includes(query)
		);
	}, [history, searchQuery]);

	const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

	const paginatedHistory = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredHistory, page]);

	const formatDate = (isoString: string) => {
		try {
			const date = new Date(isoString);
			return date.toLocaleDateString('pl-PL', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return isoString;
		}
	};

	return (
		<Box sx={{ mb: 6 }}>
			{/* Pasek nagłówkowy archiwum */}
			<Paper
				elevation={0}
				sx={{
					p: { xs: 2.5, sm: 3 },
					mb: 3,
					bgcolor: '#121824',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					borderRadius: 2,
				}}
			>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={2}
					sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
				>
					{/* Tytuł archiwum i Przycisk Wyczyszczenia dla Mobile */}
					<Stack
						direction="row"
						spacing={1.5}
						sx={{
							alignItems: 'center',
							justifyContent: 'space-between',
							width: { xs: '100%', md: 'auto' },
						}}
					>
						<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
							<Box
								sx={{
									p: 1,
									borderRadius: 2,
									bgcolor: 'rgba(59, 130, 246, 0.15)',
									display: 'flex',
									alignItems: 'center',
								}}
							>
								<HistoryIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
							</Box>
							<Box>
								<Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
									Archiwum Transkrypcji
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									Zapisano lokalnie: {history.length} materiałów wideo
								</Typography>
							</Box>
						</Stack>

						{/* Przycisk czyszczenia widoczny na urządzeniach mobilnych */}
						{history.length > 0 && (
							<Tooltip title="Wyczyść całą historię">
								<IconButton
									color="error"
									onClick={() => setConfirmClearOpen(true)}
									sx={{ display: { xs: 'inline-flex', md: 'none' } }}
								>
									<DeleteSweepIcon />
								</IconButton>
							</Tooltip>
						)}
					</Stack>

					{/* Wyszukiwarka & Akcje archiwum */}
					<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
						<TextField
							size="small"
							placeholder="Szukaj po tytule lub autorze..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							sx={{ width: { xs: '100%', sm: 260 } }}
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

						{/* Przycisk czyszczenia dla wersji desktop (md+) */}
						{history.length > 0 && (
							<Tooltip title="Wyczyść całą historię">
								<Button
									variant="outlined"
									color="error"
									size="small"
									startIcon={<DeleteSweepIcon sx={{ fontSize: 18 }} />}
									onClick={() => setConfirmClearOpen(true)}
									sx={{
										display: { xs: 'none', md: 'inline-flex' },
										borderColor: 'rgba(239, 68, 68, 0.3)',
										whiteSpace: 'nowrap',
										px: 2,
									}}
								>
									Wyczyść historię
								</Button>
							</Tooltip>
						)}
					</Stack>
				</Stack>
			</Paper>

			{/* Lista Zapisanych Kart (MUI Grid size={{ xs: 12, sm: 6, md: 4 }}) */}
			{filteredHistory.length > 0 ? (
				<>
					<Grid container spacing={2.5}>
						{paginatedHistory.map((item) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										bgcolor: '#121824',
										border: '1px solid rgba(255, 255, 255, 0.08)',
										borderRadius: 2,
										transition: 'all 0.2s ease-in-out',
										'&:hover': {
											borderColor: 'rgba(59, 130, 246, 0.4)',
											transform: 'translateY(-3px)',
											boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
										},
									}}
								>
									{/* Miniaturka wideo */}
									<Box
										sx={{
											position: 'relative',
											width: '100%',
											aspectRatio: '16/9',
											bgcolor: '#000000',
											overflow: 'hidden',
											cursor: 'pointer',
										}}
										onClick={() => onSelectHistoryItem(item)}
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={item.metadata.thumbnailUrl}
											alt={item.metadata.title}
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
										/>
										<Chip
											label={item.metadata.duration}
											size="small"
											sx={{
												position: 'absolute',
												bottom: 8,
												right: 8,
												bgcolor: 'rgba(0, 0, 0, 0.8)',
												color: '#ffffff',
												fontWeight: 600,
												fontSize: '0.7rem',
												height: 20,
											}}
										/>
									</Box>

									<CardContent
										sx={{
											flexGrow: 1,
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'space-between',
											p: 2.5,
										}}
									>
										<Box sx={{ mb: 2 }}>
											<Typography
												variant="subtitle1"
												title={item.metadata.title}
												sx={{
													fontWeight: 700,
													fontSize: '0.95rem',
													lineHeight: 1.35,
													color: 'text.primary',
													mb: 1,
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													height: '2.7em',
												}}
											>
												{item.metadata.title}
											</Typography>

											<Stack spacing={0.6}>
												<Typography
													variant="caption"
													sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}
												>
													<PersonIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
													{item.metadata.authorName}
												</Typography>
												<Typography
													variant="caption"
													sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}
												>
													<CalendarTodayIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
													Zapisano: {formatDate(item.dateAdded)}
												</Typography>
											</Stack>
										</Box>

										{/* Statystyki: Słowa & Czytanie */}
										<Stack
											direction="row"
											spacing={1}
											sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}
										>
											<Chip
												icon={<DescriptionIcon sx={{ fontSize: 13 }} />}
												label={`${item.stats.wordCount} słów`}
												size="small"
												variant="outlined"
												sx={{
													borderColor: 'rgba(255, 255, 255, 0.1)',
													color: 'text.secondary',
													fontSize: '0.7rem',
													height: 22,
												}}
											/>
											<Chip
												label={`~${item.stats.estimatedReadingTimeMinutes} min czytania`}
												size="small"
												variant="outlined"
												sx={{
													borderColor: 'rgba(255, 255, 255, 0.1)',
													color: 'text.secondary',
													fontSize: '0.7rem',
													height: 22,
												}}
											/>
										</Stack>

										{/* Przycisk akcji: Otwórz & Usuń */}
										<Stack
											direction="row"
											sx={{
												alignItems: 'center',
												justifyContent: 'space-between',
												pt: 1,
												borderTop: '1px solid rgba(255, 255, 255, 0.06)',
											}}
										>
											<Button
												variant="contained"
												size="small"
												startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
												onClick={() => onSelectHistoryItem(item)}
												sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
											>
												Otwórz
											</Button>

											<Tooltip title="Usuń z historii">
												<IconButton
													size="small"
													color="error"
													onClick={() => setItemToDelete(item.id)}
													sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
												>
													<DeleteIcon sx={{ fontSize: 18 }} />
												</IconButton>
											</Tooltip>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{/* Paginacja */}
					{totalPages > 1 && (
						<Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
							<Pagination
								count={totalPages}
								page={page}
								onChange={(_, newPage) => setPage(newPage)}
								color="primary"
								size="medium"
							/>
						</Stack>
					)}
				</>
			) : (
				<Paper
					elevation={0}
					sx={{
						p: 5,
						textAlign: 'center',
						bgcolor: '#121824',
						border: '1px dashed rgba(255, 255, 255, 0.1)',
						borderRadius: 2,
					}}
				>
					<HistoryIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5, opacity: 0.4 }} />
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
						Brak zapisanych transkrypcji
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto' }}>
						{searchQuery
							? `Brak wyników pasujących do frazy "${searchQuery}".`
							: 'Każda pomyślnie pobrana transkrypcja zostanie automatycznie zapisana w tym miejscu w pamięci przeglądarki.'}
					</Typography>
				</Paper>
			)}

			{/* Dialog potwierdzenia wyczyszczenia całej historii */}
			<Dialog
				open={confirmClearOpen}
				onClose={() => setConfirmClearOpen(false)}
				slotProps={{
					paper: {
						sx: {
							bgcolor: '#121824',
							backgroundImage: 'none',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							borderRadius: 2,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Wyczyścić całą historię?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: 'text.secondary' }}>
						Czy na pewno chcesz usunąć wszystkie zapisane transkrypcje ({history.length} wideo) z
						pamięci lokalnej? Ta akcja jest nieodwracalna.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}>
					<Button onClick={() => setConfirmClearOpen(false)} variant="outlined" color="inherit">
						Anuluj
					</Button>
					<Button
						onClick={() => {
							onClearHistory();
							setConfirmClearOpen(false);
						}}
						variant="contained"
						color="error"
					>
						Wyczyść wszystko
					</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog potwierdzenia usunięcia pojedynczego elementu */}
			<Dialog
				open={Boolean(itemToDelete)}
				onClose={() => setItemToDelete(null)}
				slotProps={{
					paper: {
						sx: {
							bgcolor: '#121824',
							backgroundImage: 'none',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							borderRadius: 2,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Usuń z historii</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: 'text.secondary' }}>
						Czy na pewno chcesz usunąć tę transkrypcję z historii lokalnej?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}>
					<Button onClick={() => setItemToDelete(null)} variant="outlined" color="inherit">
						Anuluj
					</Button>
					<Button
						onClick={() => {
							if (itemToDelete) onDeleteItem(itemToDelete);
							setItemToDelete(null);
						}}
						variant="contained"
						color="error"
					>
						Usuń
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
