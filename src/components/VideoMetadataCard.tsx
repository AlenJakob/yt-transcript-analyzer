'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Link, Stack, Button } from '@mui/material';
import { VideoMetadata, TranscriptStats } from '@/lib/youtube';
import VideoPlayer from '@/components/VideoPlayer';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NumbersIcon from '@mui/icons-material/Numbers';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';

interface VideoMetadataCardProps {
	metadata: VideoMetadata;
	stats: TranscriptStats;
}

export default function VideoMetadataCard({ metadata, stats }: VideoMetadataCardProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const youtubeWatchUrl = `https://www.youtube.com/watch?v=${metadata.videoId}`;

	return (
		<Card sx={{ mb: 4, overflow: 'hidden' }}>
			<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
				<Grid container spacing={3} sx={{ alignItems: 'center' }}>
					{/* Odtwarzacz Wideo / Miniaturka */}
					<Grid size={{ xs: 12, md: 5 }}>
						<VideoPlayer
							key={`${metadata.videoId}-${isPlaying}`}
							videoId={metadata.videoId}
							title={metadata.title}
							thumbnailUrl={metadata.thumbnailUrl}
							autoPlayOnMount={isPlaying}
							onClosePlayer={() => setIsPlaying(false)}
						/>
					</Grid>

					{/* Dane wideo i statystyki */}
					<Grid size={{ xs: 12, md: 7 }}>
						<Stack spacing={1.5}>
							<Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
								{metadata.title}
							</Typography>

							<Stack
								direction="row"
								spacing={1.5}
								sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
							>
								<Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
									<PersonIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
									<Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
										{metadata.authorName}
									</Typography>
								</Stack>
								<Typography variant="caption" sx={{ color: 'text.disabled' }}>
									•
								</Typography>

								<Button
									variant={isPlaying ? 'outlined' : 'contained'}
									size="small"
									color={isPlaying ? 'inherit' : 'error'}
									startIcon={
										isPlaying ? (
											<CloseIcon sx={{ fontSize: 16 }} />
										) : (
											<PlayArrowIcon sx={{ fontSize: 16 }} />
										)
									}
									onClick={() => setIsPlaying(!isPlaying)}
									sx={{
										fontSize: '0.8rem',
										fontWeight: 600,
										borderRadius: 2,
										py: 0.4,
										px: 1.5,
										...(isPlaying
											? { borderColor: 'rgba(255, 255, 255, 0.2)', color: 'text.secondary' }
											: { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }),
									}}
								>
									{isPlaying ? 'Zamknij odtwarzacz' : 'Odtwórz wideo'}
								</Button>

								<Link
									href={youtubeWatchUrl}
									target="_blank"
									rel="noopener noreferrer"
									underline="hover"
									sx={{
										color: '#9ca3af',
										fontSize: '0.85rem',
										fontWeight: 600,
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.5,
										'&:hover': { color: '#ef4444' },
									}}
								>
									Otwórz na YouTube <OpenInNewIcon sx={{ fontSize: 16 }} />
								</Link>
							</Stack>

							{/* Statystyki transkrypcji */}
							<Box
								sx={{
									pt: 1.5,
									display: 'flex',
									gap: 1.5,
									flexWrap: 'wrap',
								}}
							>
								<Chip
									icon={<DescriptionIcon sx={{ fontSize: 18, color: '#3b82f6 !important' }} />}
									label={`${stats.wordCount.toLocaleString('pl-PL')} słów`}
									sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 600 }}
								/>
								<Chip
									icon={<NumbersIcon sx={{ fontSize: 18, color: '#06b6d4 !important' }} />}
									label={`${stats.charCount.toLocaleString('pl-PL')} znaków`}
									sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', fontWeight: 600 }}
								/>
								<Chip
									icon={<AccessTimeIcon sx={{ fontSize: 18, color: '#10b981 !important' }} />}
									label={`~${stats.readingTimeMinutes} min czytania`}
									sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: 600 }}
								/>
							</Box>
						</Stack>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
