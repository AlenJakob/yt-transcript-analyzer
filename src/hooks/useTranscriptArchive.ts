'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { VideoMetadata, TranscriptSegment, TranscriptStats } from '@/lib/youtube';
import { getHistory, saveToHistory, loadFullHistoryItem, HistoryItem } from '@/lib/storage';

export interface UseTranscriptArchiveReturn {
	isLoading: boolean;
	error: string | null;
	metadata: VideoMetadata | null;
	segments: TranscriptSegment[];
	stats: TranscriptStats | null;
	history: HistoryItem[];
	handleFetchTranscript: (url: string, preferredLanguage?: 'pl' | 'en' | 'auto') => Promise<void>;
}

export function useTranscriptArchive(): UseTranscriptArchiveReturn {
	const searchParams = useSearchParams();
	const videoIdParam = searchParams.get('videoId');

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
	const [segments, setSegments] = useState<TranscriptSegment[]>([]);
	const [stats, setStats] = useState<TranscriptStats | null>(null);
	const [history, setHistory] = useState<HistoryItem[]>([]);

	// Read local storage history and active video item on mount/searchParam change
	useEffect(() => {
		try {
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
		} catch (err) {
			console.error('Error reading history from localStorage:', err);
		}
	}, [videoIdParam]);

	const handleFetchTranscript = useCallback(
		async (url: string, preferredLanguage?: 'pl' | 'en' | 'auto') => {
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
					setError(data.error || 'An error occurred while fetching the transcript.');
					if (data.metadata) {
						setMetadata(data.metadata);
					}
					return;
				}

				setMetadata(data.metadata);
				setSegments(data.segments);
				setStats(data.stats);

				// Auto-save to localStorage history
				const updatedHistory = saveToHistory(data.metadata, data.segments, data.stats);
				setHistory(updatedHistory);
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : 'Unexpected network error.';
				setError(`Connection error: ${msg}`);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	return {
		isLoading,
		error,
		metadata,
		segments,
		stats,
		history,
		handleFetchTranscript,
	};
}
