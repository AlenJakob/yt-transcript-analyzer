'use client';

import {
	Grid,
	Card,
	CardContent,
	Box,
	Typography,
	Button,
	Chip,
	IconButton,
	Tooltip,
	Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { HistoryItem } from '@/lib/storage';
import { formatDate } from '@/utils/helper';

interface ArchiveCardProps {
	item: HistoryItem;
	onSelect: (item: HistoryItem) => void;
	onDelete: (id: string) => void;
}

export default function ArchiveCard({ item, onSelect, onDelete }: ArchiveCardProps) {
	return (
		<Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
			<Card
				sx={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 2,
					transition: 'all 0.2s ease-in-out',
					'&:hover': {
						borderColor: 'rgba(59, 130, 246, 0.4)',
						transform: 'translateY(-3px)',
						boxShadow: (theme) =>
							theme.palette.mode === 'dark'
								? '0 8px 24px rgba(0, 0, 0, 0.35)'
								: '0 8px 24px rgba(0, 0, 0, 0.08)',
					},
				}}
			>
				<Box
					sx={{
						position: 'relative',
						width: '100%',
						aspectRatio: '16/9',
						bgcolor: '#000000',
						overflow: 'hidden',
						cursor: 'pointer',
					}}
					onClick={() => onSelect(item)}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={item.metadata.thumbnailUrl}
						alt={item.metadata.title}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
					<Chip
						label={`~${item.stats.readingTimeMinutes} min`}
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
								sx={{
									color: 'text.secondary',
									display: 'flex',
									alignItems: 'center',
									gap: 0.8,
								}}
							>
								<PersonIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
								{item.metadata.authorName}
							</Typography>
							<Typography
								variant="caption"
								sx={{
									color: 'text.secondary',
									display: 'flex',
									alignItems: 'center',
									gap: 0.8,
								}}
							>
								<CalendarTodayIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
								Zapisano: {formatDate(item.dateAdded)}
							</Typography>
						</Stack>
					</Box>

					<Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
						<Chip
							icon={<DescriptionIcon sx={{ fontSize: 13 }} />}
							label={`${item.stats.wordCount} słów`}
							size="small"
							variant="outlined"
							sx={{
								borderColor: 'divider',
								color: 'text.secondary',
								fontSize: '0.7rem',
								height: 22,
							}}
						/>
						<Chip
							label={`~${item.stats.readingTimeMinutes} min czytania`}
							size="small"
							variant="outlined"
							sx={{
								borderColor: 'divider',
								color: 'text.secondary',
								fontSize: '0.7rem',
								height: 22,
							}}
						/>
					</Stack>

					<Stack
						direction="row"
						sx={{
							alignItems: 'center',
							justifyContent: 'space-between',
							pt: 1,
							borderTop: '1px solid',
							borderColor: 'divider',
						}}
					>
						<Button
							variant="contained"
							size="small"
							startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
							onClick={() => onSelect(item)}
							sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
						>
							Otwórz
						</Button>

						<Tooltip title="Usuń z historii">
							<IconButton
								size="small"
								color="error"
								onClick={() => onDelete(item.id)}
								sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
							>
								<DeleteIcon sx={{ fontSize: 18 }} />
							</IconButton>
						</Tooltip>
					</Stack>
				</CardContent>
			</Card>
		</Grid>
	);
}
