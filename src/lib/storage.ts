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
 * Calculates total localStorage usage in KB and MB across all keys
 */
export function getLocalStorageUsage(): { totalKb: number; totalMb: number; historyKb: number } {
	if (typeof window === 'undefined') return { totalKb: 0, totalMb: 0, historyKb: 0 };
	try {
		let totalChars = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				const val = localStorage.getItem(key) || '';
				totalChars += key.length + val.length;
			}
		}
		const historyRaw = localStorage.getItem(STORAGE_KEY) || '';
		const historyKb = Number((historyRaw.length / 1024).toFixed(2));
		const totalKb = Number((totalChars / 1024).toFixed(2));
		const totalMb = Number((totalKb / 1024).toFixed(2));
		return { totalKb, totalMb, historyKb };
	} catch {
		return { totalKb: 0, totalMb: 0, historyKb: 0 };
	}
}

/**
 * Loads all saved transcript history from localStorage with performance logging
 */
export function getHistory(): HistoryItem[] {
	if (typeof window === 'undefined') return [];
	const startTime = performance.now();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as HistoryItem[];
		const endTime = performance.now();
		const duration = (endTime - startTime).toFixed(2);
		const usage = getLocalStorageUsage();

		console.log(
			`[Storage Perf] Odczytano ${parsed.length} rekordów w ${duration} ms | Historia: ${usage.historyKb} KB | Cały localStorage: ${usage.totalKb} KB (${usage.totalMb} MB / ~5MB max limit)`
		);
		return parsed;
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
	const startTime = performance.now();
	try {
		const history = getHistory();
		const filtered = history.filter((item) => item.id !== metadata.videoId);

		const newItem: HistoryItem = {
			id: metadata.videoId,
			dateAdded: new Date().toISOString(),
			metadata,
			segments,
			stats,
		};

		const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
		const jsonString = JSON.stringify(updated);
		localStorage.setItem(STORAGE_KEY, jsonString);
		const endTime = performance.now();
		const duration = (endTime - startTime).toFixed(2);
		const usage = getLocalStorageUsage();

		console.log(
			`[Storage Perf] Zapisano ${updated.length} rekordów w ${duration} ms | Rozmiar historii: ${usage.historyKb} KB | Cały localStorage: ${usage.totalKb} KB (${usage.totalMb} MB)`
		);
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
		const usage = getLocalStorageUsage();
		console.log(
			`[Storage Perf] Usunięto element. Pozostało ${updated.length} rekordów | Rozmiar: ${usage.historyKb} KB`
		);
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
		console.log('[Storage Perf] Wyczyszczono historię. Waga: 0 KB');
		return [];
	} catch (err) {
		console.error('Błąd podczas czyszczenia historii:', err);
		return [];
	}
}

export interface UserPreferences {
	preferredLanguage: 'pl' | 'en' | 'auto';
}

const PREFERENCES_STORAGE_KEY = 'yt_transcript_user_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
	preferredLanguage: 'pl',
};

/**
 * Loads user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
	if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
	try {
		const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
		if (!raw) return DEFAULT_PREFERENCES;
		return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
	} catch (err) {
		console.error('Błąd podczas odczytu preferencji użytkownika:', err);
		return DEFAULT_PREFERENCES;
	}
}

/**
 * Saves user preferences to localStorage
 */
export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
	if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
	try {
		const current = getUserPreferences();
		const updated = { ...current, ...prefs };
		localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
		return updated;
	} catch (err) {
		console.error('Błąd podczas zapisu preferencji użytkownika:', err);
		return DEFAULT_PREFERENCES;
	}
}
