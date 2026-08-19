'use client';

import { Paper, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

interface ArchiveEmptyStateProps {
	searchQuery: string;
}

export default function ArchiveEmptyState({ searchQuery }: ArchiveEmptyStateProps) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 5,
				textAlign: 'center',
				bgcolor: 'background.paper',
				border: '1px dashed',
				borderColor: 'divider',
				borderRadius: 2,
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 8px 24px rgba(0, 0, 0, 0.35)'
						: '0 2px 12px rgba(0, 0, 0, 0.04)',
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
	);
}
