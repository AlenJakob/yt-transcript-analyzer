import { VideoMetadata, TranscriptSegment, TranscriptStats } from './youtube';

export interface HistoryItem {
	id: string; // videoId
	dateAdded: string; // ISO date string
	metadata: VideoMetadata;
	segments: TranscriptSegment[];
	stats: TranscriptStats;
}

const STORAGE_KEY = 'yt_transcript_history_v1';
const MAX_HISTORY_ITEMS = 50;

/**
 * Loads all saved transcript history from localStorage
 */
export function getHistory(): HistoryItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as HistoryItem[];
	} catch (err) {
		console.error('Błąd podczas odczytu historii z localStorage:', err);
		return [];
	}
}

/**
 * Saves a successful transcript result into localStorage history
 */
export function saveToHistory(
	metadata: VideoMetadata,
	segments: TranscriptSegment[],
	stats: TranscriptStats
): HistoryItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const history = getHistory();
		// Check if video already exists in history - if so, remove old entry to put updated one at top
		const filtered = history.filter((item) => item.id !== metadata.videoId);

		const newItem: HistoryItem = {
			id: metadata.videoId,
			dateAdded: new Date().toISOString(),
			metadata,
			segments,
			stats,
		};

		const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch (err) {
		console.error('Błąd podczas zapisu transkrypcji do localStorage:', err);
		return getHistory();
	}
}

/**
 * Removes a single item from history by videoId
 */
export function removeFromHistory(videoId: string): HistoryItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const history = getHistory();
		const updated = history.filter((item) => item.id !== videoId);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch (err) {
		console.error('Błąd podczas usuwania elementu z historii:', err);
		return getHistory();
	}
}

/**
 * Clears all items from history
 */
export function clearHistory(): HistoryItem[] {
	if (typeof window === 'undefined') return [];
	try {
		localStorage.removeItem(STORAGE_KEY);
		return [];
	} catch (err) {
		console.error('Błąd podczas czyszczenia historii:', err);
		return [];
	}
}
