'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Box, Typography, Paper } from '@mui/material';
import Header from '@/components/Header';
import UrlInputForm from '@/components/UrlInputForm';
import VideoMetadataCard from '@/components/VideoMetadataCard';
import TranscriptViewer from '@/components/TranscriptViewer/TranscriptViewer';
import AiAnalysisPresets from '@/components/AiAnalysisPresets';
import { VideoMetadata, TranscriptSegment, TranscriptStats } from '@/lib/youtube';
import {
	getHistory,
	saveToHistory,
	loadFullHistoryItem,
	HistoryItem,
} from '@/lib/storage';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InfoIcon from '@mui/icons-material/Info';

function AnalyzerContent() {
	const searchParams = useSearchParams();
	const videoIdParam = searchParams.get('videoId');

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
	const [segments, setSegments] = useState<TranscriptSegment[]>([]);
	const [stats, setStats] = useState<TranscriptStats | null>(null);
	const [history, setHistory] = useState<HistoryItem[]>([]);

	// Odczyt zapisanego archiwum po załadowaniu na kliencie
	useEffect(() => {
		const loadedHistory = getHistory();
		setHistory(loadedHistory);

		if (videoIdParam) {
			const targetItem = loadedHistory.find((item) => item.id === videoIdParam);
			if (targetItem) {
				const fullItem = loadFullHistoryItem(targetItem);
				setMetadata(fullItem.metadata);
				setSegments(fullItem.segments);
				setStats(fullItem.stats);
			}
		}
	}, [videoIdParam]);

	const handleFetchTranscript = async (url: string, preferredLanguage?: 'pl' | 'en' | 'auto') => {
		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/transcript', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url, preferredLanguage }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || 'Wystąpił błąd podczas pobierania transkrypcji.');
				if (data.metadata) {
					setMetadata(data.metadata);
				}
				setIsLoading(false);
				return;
			}

			setMetadata(data.metadata);
			setSegments(data.segments);
			setStats(data.stats);

			// Automatyczny zapis w archiwum localStorage
			const updatedHistory = saveToHistory(data.metadata, data.segments, data.stats);
			setHistory(updatedHistory);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd sieci.';
			setError(`Błąd połączenia: ${msg}`);
		} finally {
			setIsLoading(false);
		}
	};

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
				{metadata && stats && <VideoMetadataCard metadata={metadata} stats={stats} />}

				{/* Podgląd Transkrypcji & Szablony AI */}
				{segments.length > 0 && metadata && (
					<>
						<TranscriptViewer segments={segments} videoId={metadata.videoId} />
						<AiAnalysisPresets segments={segments} videoTitle={metadata.title} />
					</>
				)}

				{/* Stan początkowy - Brak jeszcze wczytanej transkrypcji */}
				{!metadata && !isLoading && (
					<Paper
						elevation={0}
						sx={{
							p: { xs: 4, sm: 6 },
							textAlign: 'center',
							bgcolor: 'rgba(18, 24, 36, 0.5)',
							border: '1px dashed rgba(255, 255, 255, 0.1)',
							borderRadius: 2,
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
							Wklej dowolny adres URL z serwisu YouTube w powyższym polu lub otwórz wcześniej
							zapisaną transkrypcję z zakłdaki <strong>Archiwum ({history.length})</strong>.
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
							<InfoIcon sx={{ fontSize: 16 }} /> Obsługuje filmy wideo, YouTube Shorts oraz
							linki skrócone `youtu.be`.
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
