'use client';

import { useState, useMemo } from 'react';
import { Box, Button, Stack, Typography, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export interface VideoPlayerProps {
	videoId: string;
	title?: string;
	thumbnailUrl: string;
	autoplay?: boolean;
	startTimeSeconds?: number;
	autoPlayOnMount?: boolean;
	onClosePlayer?: () => void;
}

export default function VideoPlayer({
	videoId,
	title = 'Wideo YouTube',
	thumbnailUrl,
	autoplay = true,
	startTimeSeconds = 0,
	autoPlayOnMount = false,
	onClosePlayer,
}: VideoPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(autoPlayOnMount);

	const embedUrl = useMemo(() => {
		const params = new URLSearchParams();
		if (autoplay) params.append('autoplay', '1');
		if (startTimeSeconds > 0) params.append('start', Math.floor(startTimeSeconds).toString());
		params.append('rel', '0');

		return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
	}, [videoId, autoplay, startTimeSeconds]);

	return (
		<Box
			sx={{
				position: 'relative',
				width: '100%',
				aspectRatio: '16/9',
				borderRadius: 2,
				overflow: 'hidden',
				boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				bgcolor: '#000000',
			}}
		>
			{isPlaying ? (
				<Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
					<iframe
						src={embedUrl}
						title={title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						style={{ width: '100%', height: '100%', border: 0 }}
					/>

					{/* Przycisk zamknięcia na wideo */}
					<Tooltip title="Zamknij odtwarzacz i pokaż miniaturkę">
						<Button
							variant="contained"
							size="small"
							onClick={() => {
								setIsPlaying(false);
								if (onClosePlayer) onClosePlayer();
							}}
							startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
							sx={{
								position: 'absolute',
								top: 8,
								right: 8,
								zIndex: 10,
								bgcolor: 'rgba(0, 0, 0, 0.75)',
								backdropFilter: 'blur(8px)',
								color: '#ffffff',
								fontSize: '0.75rem',
								fontWeight: 600,
								px: 1.2,
								py: 0.3,
								border: '1px solid rgba(255, 255, 255, 0.2)',
								'&:hover': {
									bgcolor: 'rgba(239, 68, 68, 0.9)',
								},
							}}
						>
							Zamknij
						</Button>
					</Tooltip>
				</Box>
			) : (
				<Box
					onClick={() => setIsPlaying(true)}
					sx={{
						position: 'relative',
						width: '100%',
						height: '100%',
						cursor: 'pointer',
						'&:hover .play-btn': {
							transform: 'translate(-50%, -50%) scale(1.15)',
							bgcolor: '#ef4444',
							boxShadow: '0 0 30px rgba(239, 68, 68, 0.85)',
						},
						'&:hover img': {
							transform: 'scale(1.05)',
						},
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={thumbnailUrl}
						alt={title}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							transition: 'transform 0.35s ease',
						}}
					/>

					{/* Gradient Overlay */}
					<Box
						sx={{
							position: 'absolute',
							inset: 0,
							background:
								'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)',
						}}
					/>

					{/* Play Button Overlay */}
					<Stack
						className="play-btn"
						direction="row"
						spacing={1}
						sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							bgcolor: 'rgba(239, 68, 68, 0.92)',
							color: '#ffffff',
							px: 2.5,
							py: 1.2,
							borderRadius: 2,
							alignItems: 'center',
							boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
							transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					>
						<PlayArrowIcon sx={{ fontSize: 28 }} />
						<Typography variant="button" sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
							Odtwórz wideo
						</Typography>
					</Stack>

					{/* Target Link Hint */}
					<Box
						sx={{
							position: 'absolute',
							bottom: 12,
							right: 12,
							bgcolor: 'rgba(0, 0, 0, 0.65)',
							backdropFilter: 'blur(4px)',
							px: 1.2,
							py: 0.4,
							borderRadius: 2,
							display: 'flex',
							alignItems: 'center',
							gap: 0.5,
							color: 'rgba(255, 255, 255, 0.8)',
							fontSize: '0.75rem',
						}}
					>
						<OpenInNewIcon sx={{ fontSize: 13 }} /> YouTube Embed
					</Box>
				</Box>
			)}
		</Box>
	);
}
