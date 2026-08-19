'use client';

import { useState, useEffect, startTransition } from 'react';
import { Paper, Box, Typography, Button, TextField, InputAdornment, Stack, Tooltip, IconButton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';

interface ArchiveHeaderProps {
	historyCount: number;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onConfirmClearOpen: () => void;
}

export default function ArchiveHeader({
	historyCount,
	searchQuery,
	onSearchChange,
	onConfirmClearOpen,
}: ArchiveHeaderProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3 },
				mb: 3,
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
			>
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
								{mounted ? `Zapisano lokalnie: ${historyCount} materiałów wideo` : 'Zapisano lokalnie materiały wideo'}
							</Typography>
						</Box>
					</Stack>

					{mounted && historyCount > 0 && (
						<Tooltip title="Wyczyść całą historię">
							<IconButton
								color="error"
								onClick={onConfirmClearOpen}
								sx={{
									display: { xs: 'inline-flex', md: 'none' },
									color: '#ef4444',
									bgcolor: (theme) =>
										theme.palette.mode === 'dark'
											? 'rgba(239, 68, 68, 0.12)'
											: 'rgba(239, 68, 68, 0.08)',
									border: '1px solid',
									borderColor: (theme) =>
										theme.palette.mode === 'dark'
											? 'rgba(239, 68, 68, 0.3)'
											: 'rgba(239, 68, 68, 0.25)',
									borderRadius: 2,
									p: 0.75,
									transition: 'all 0.2s ease-in-out',
									'&:hover': {
										bgcolor: '#ef4444',
										color: '#ffffff',
										borderColor: '#ef4444',
									},
								}}
							>
								<DeleteSweepIcon sx={{ fontSize: 20 }} />
							</IconButton>
						</Tooltip>
					)}
				</Stack>

				<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
					<TextField
						size="small"
						placeholder="Szukaj po tytule lub autorze..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
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

					{mounted && historyCount > 0 && (
						<Tooltip title="Wyczyść całą historię">
							<Button
								variant="outlined"
								color="error"
								size="small"
								startIcon={<DeleteSweepIcon sx={{ fontSize: 18 }} />}
								onClick={onConfirmClearOpen}
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
	);
}
