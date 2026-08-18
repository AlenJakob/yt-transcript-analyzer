'use client';

import { Suspense } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import Header from '@/components/Header';
import UrlInputForm from '@/components/UrlInputForm';
import VideoMetadataCard from '@/components/VideoMetadataCard';
import TranscriptViewer from '@/components/TranscriptViewer/TranscriptViewer';
import AiAnalysisPresets from '@/components/AiAnalysisPresets';
import { useTranscriptArchive } from '@/hooks/useTranscriptArchive';
import { useAuthUser } from '@/hooks/useAuthUser';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InfoIcon from '@mui/icons-material/Info';

function AnalyzerContent() {
	const {
		isLoading,
		error,
		metadata,
		segments,
		stats,
		history,
		handleFetchTranscript,
	} = useTranscriptArchive();
	const { isAdmin } = useAuthUser();

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
			<Header historyCount={history.length} />

			<Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
				{/* Formularz wprowadzania URL */}
				<UrlInputForm
					onFetchTranscript={handleFetchTranscript}
					isLoading={isLoading}
					error={error}
				/>

				{/* Dane wideo oraz Statystyki */}
				{metadata && stats && (
					<VideoMetadataCard metadata={metadata} stats={stats} />
				)}

				{/* Podgląd Transkrypcji & Szablony AI */}
				{segments.length > 0 && metadata && (
					<>
						<TranscriptViewer segments={segments} videoId={metadata.videoId} />
						{isAdmin && (
							<AiAnalysisPresets
								segments={segments}
								videoTitle={metadata.title}
							/>
						)}
					</>
				)}

				{/* Stan początkowy - Brak jeszcze wczytanej transkrypcji */}
				{!metadata && !isLoading && (
					<Paper
						elevation={0}
						sx={{
							p: { xs: 4, sm: 6 },
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
						<Box
							sx={{
								width: 64,
								height: 64,
								borderRadius: '50%',
								bgcolor: 'rgba(239, 68, 68, 0.1)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								mx: 'auto',
								mb: 2,
							}}
						>
							<YouTubeIcon sx={{ color: '#ef4444', fontSize: 36 }} />
						</Box>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Gotowy do analizy filmu?
						</Typography>
						<Typography
							variant="body2"
							sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto', mb: 3 }}
						>
							Wklej dowolny adres URL z serwisu YouTube w powyższym polu lub
							otwórz wcześniej zapisaną transkrypcję z zakładki{' '}
							<strong>Archiwum ({history.length})</strong>.
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.disabled',
								display: 'inline-flex',
								alignItems: 'center',
								gap: 0.5,
							}}
						>
							<InfoIcon sx={{ fontSize: 16 }} /> Obsługuje filmy wideo, YouTube
							Shorts oraz linki skrócone `youtu.be`.
						</Typography>
					</Paper>
				)}
			</Container>
		</Box>
	);
}

export default function Home() {
	return (
		<Suspense fallback={null}>
			<AnalyzerContent />
		</Suspense>
	);
}
