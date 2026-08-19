import { YoutubeTranscript, TranscriptResponse } from 'youtube-transcript';

export type PreferredLanguage = 'pl' | 'en' | 'auto';

export interface TranscriptSegment {
	text: string;
	duration: number;
	offset: number;
	timestamp: string; // e.g. "02:15"
}

export interface VideoMetadata {
	videoId: string;
	title: string;
	authorName: string;
	thumbnailUrl: string;
}

export interface TranscriptStats {
	wordCount: number;
	charCount: number;
	readingTimeMinutes: number;
}

export interface FetchTranscriptResult {
	rawTranscript: TranscriptResponse[];
	language: string;
}

/**
 * Custom fetch implementation for YoutubeTranscript that injects browser User-Agent,
 * Accept-Language and GDPR consent cookies to avoid datacenter IP blocking on Vercel/AWS.
 */
const customYoutubeFetch = (
	url: RequestInfo | URL,
	options: RequestInit = {}
) => {
	const headers = new Headers(options.headers || {});
	if (!headers.has('User-Agent')) {
		headers.set(
			'User-Agent',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
		);
	}
	if (!headers.has('Accept-Language')) {
		headers.set('Accept-Language', 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7');
	}
	if (!headers.has('Cookie')) {
		headers.set(
			'Cookie',
			'CONSENT=YES+cb.20210328-17-p0.en+FX+417; SOCS=CAESEwgDEgk0ODE3Nzk3MjAaAmVuIAEaBgiA_LyaBg'
		);
	}
	return fetch(url, { ...options, headers });
};

/**
 * Fetches transcript with language fallback cascade (e.g. 'pl' -> 'en' -> default)
 */
export async function fetchTranscriptWithFallback(
	videoId: string,
	preferredLangs: string[] = ['pl', 'en']
): Promise<FetchTranscriptResult> {
	let lastError: unknown = null;

	const strategies = [
		{ name: 'custom', fetchFn: customYoutubeFetch },
		{ name: 'default', fetchFn: fetch }
	];

	// Try each preferred language in priority order
	for (const lang of preferredLangs) {
		for (const strategy of strategies) {
			try {
				const res = await YoutubeTranscript.fetchTranscript(videoId, {
					lang,
					fetch: strategy.fetchFn,
				});
				if (res && res.length > 0) {
					return { rawTranscript: res, language: lang };
				}
			} catch (err) {
				lastError = err;
			}
		}
	}

	// Fallback to default/original language transcript
	for (const strategy of strategies) {
		try {
			const res = await YoutubeTranscript.fetchTranscript(videoId, {
				fetch: strategy.fetchFn,
			});
			if (res && res.length > 0) {
				return { rawTranscript: res, language: 'default' };
			}
		} catch (err) {
			lastError = err;
		}
	}

	const errorMessage =
		lastError instanceof Error ? lastError.message : 'Brak dostępnych napisów';
	throw new Error(errorMessage);
}

/**
 * Extracts YouTube Video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Plain Video ID (11 chars)
 */
export function extractYouTubeVideoId(urlOrId: string): string | null {
	if (!urlOrId || typeof urlOrId !== 'string') {
		return null;
	}

	const trimmed = urlOrId.trim();

	// If it's already an 11-char ID
	if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
		return trimmed;
	}

	// Regex patterns for YouTube URLs
	const patterns = [
		/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
	];

	for (const pattern of patterns) {
		const match = trimmed.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
}

/**
 * Formats seconds offset to mm:ss or hh:mm:ss string
 */
export function formatTimestamp(seconds: number): string {
	const totalSeconds = Math.floor(seconds);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	const pad = (num: number) => num.toString().padStart(2, '0');

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(secs)}`;
	}
	return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Fetches YouTube video metadata via public oEmbed API
 */
export async function fetchVideoMetadata(
	videoId: string
): Promise<VideoMetadata> {
	const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
	const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

	try {
		const res = await fetch(oembedUrl);
		if (!res.ok) {
			throw new Error(`OEmbed error: ${res.statusText}`);
		}
		const data = await res.json();
		return {
			videoId,
			title: data.title || 'Brak tytułu',
			authorName: data.author_name || 'Nieznany kanał',
			thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
		};
	} catch {
		return {
			videoId,
			title: `Film YouTube (${videoId})`,
			authorName: 'YouTube',
			thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
		};
	}
}

/**
 * Calculates text stats (word count, character count, estimated reading time)
 */
export function calculateTranscriptStats(
	segments: TranscriptSegment[]
): TranscriptStats {
	const fullText = segments.map((s) => s.text).join(' ');
	const words = fullText.trim().split(/\s+/).filter(Boolean);
	const wordCount = words.length;
	const charCount = fullText.length;
	// Avg reading speed: ~200 words per minute
	const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

	return {
		wordCount,
		charCount,
		readingTimeMinutes,
	};
}

/**
 * Groups fine-grained segments into larger logical chunks (e.g. 30s or 60s intervals)
 */
export function groupTranscriptSegments(
	segments: TranscriptSegment[],
	groupDurationSeconds: number = 30
): TranscriptSegment[] {
	if (!segments || segments.length === 0) {
		return [];
	}

	const grouped: TranscriptSegment[] = [];
	let currentGroupText: string[] = [];
	let currentStartOffset = segments[0].offset;
	let currentDuration = 0;

	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];

		if (currentGroupText.length === 0) {
			currentStartOffset = seg.offset;
		}

		currentGroupText.push(seg.text.trim());
		currentDuration += seg.duration;

		// Flush group if target duration reached or it's the last element
		if (currentDuration >= groupDurationSeconds || i === segments.length - 1) {
			const combinedText = currentGroupText
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim();
			if (combinedText) {
				grouped.push({
					text: combinedText,
					offset: currentStartOffset,
					duration: currentDuration,
					timestamp: formatTimestamp(currentStartOffset),
				});
			}
			currentGroupText = [];
			currentDuration = 0;
		}
	}

	return grouped;
}

/**
 * Formats full transcript text into beautifully clean, structured paragraphs
 */
export function formatContinuousParagraphs(
	segments: TranscriptSegment[]
): string[] {
	if (!segments || segments.length === 0) {
		return [];
	}

	// Join all raw segment texts
	let rawText = segments.map((s) => s.text.trim()).join(' ');

	// Clean up extra whitespace and HTML entity residues
	rawText = rawText.replace(/\s+/g, ' ').trim();

	// If text is all lowercase (common in YouTube auto-generated captions), attempt sentence capitalization
	const words = rawText.split(' ');
	const paragraphs: string[] = [];
	let currentParagraphWords: string[] = [];
	let wordCount = 0;

	for (let i = 0; i < words.length; i++) {
		let word = words[i];

		// Capitalize first word of a paragraph
		if (currentParagraphWords.length === 0 && word.length > 0) {
			word = word.charAt(0).toUpperCase() + word.slice(1);
		}

		currentParagraphWords.push(word);
		wordCount++;

		// Check if word ends a sentence or if paragraph length threshold (~60-80 words or ~400 chars) is reached
		const endsWithSentencePunctuation = /[.!?]$/.test(word);

		if ((wordCount >= 60 && endsWithSentencePunctuation) || wordCount >= 90) {
			let paragraphText = currentParagraphWords.join(' ');
			// Ensure period at end if missing
			if (!/[.!?]$/.test(paragraphText)) {
				paragraphText += '.';
			}
			paragraphs.push(paragraphText);
			currentParagraphWords = [];
			wordCount = 0;
		}
	}

	if (currentParagraphWords.length > 0) {
		let lastParagraphText = currentParagraphWords.join(' ');
		if (!/[.!?]$/.test(lastParagraphText)) {
			lastParagraphText += '.';
		}
		paragraphs.push(lastParagraphText);
	}

	return paragraphs;
}
