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

export interface TranscriptResponse {
	text: string;
	duration: number;
	offset: number;
	lang?: string;
}

export interface FetchTranscriptResult {
	rawTranscript: TranscriptResponse[];
	language: string;
	rapidApiUsage?: {
		limit: string | null;
		remaining: string | null;
	};
}

import { YoutubeTranscript } from 'youtube-transcript';

const INVIDIOUS_INSTANCES = [
	'https://vid.puffyan.us',
	'https://invidious.nerdvpn.de',
	'https://inv.tux.pizza',
	'https://invidious.protokolla.fi'
];

function parseVttTime(timeStr: string): number {
	const parts = timeStr.split(':');
	let seconds = 0;
	if (parts.length === 3) {
		seconds += parseFloat(parts[0]) * 3600;
		seconds += parseFloat(parts[1]) * 60;
		seconds += parseFloat(parts[2].replace(',', '.'));
	}
	return seconds;
}

async function fetchInvidiousTranscript(videoId: string, preferredLangs: string[]): Promise<{ rawTranscript: TranscriptResponse[], finalLang: string }> {
	for (const instance of INVIDIOUS_INSTANCES) {
		try {
			// 1. Get captions list
			const infoRes = await fetch(`${instance}/api/v1/captions/${videoId}`);
			if (!infoRes.ok) continue;
			
			const infoData = await infoRes.json();
			const captions = infoData.captions;
			if (!captions || captions.length === 0) continue;

			// 2. Find preferred language or default
			let selectedCaption = captions.find((c: any) => preferredLangs.includes(c.languageCode));
			if (!selectedCaption) selectedCaption = captions[0];

			// 3. Download VTT
			const vttRes = await fetch(`${instance}${selectedCaption.url}`);
			if (!vttRes.ok) continue;

			const vttText = await vttRes.text();
			
			// 4. Parse VTT
			const mappedTranscript: TranscriptResponse[] = [];
			const blockRegex = /(\d{2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.,]\d{3}).*?\n([\s\S]*?)(?=\n\n|$)/g;
			
			let match;
			while ((match = blockRegex.exec(vttText)) !== null) {
				const start = parseVttTime(match[1]);
				const end = parseVttTime(match[2]);
				const text = match[3].replace(/<[^>]+>/g, '').trim().replace(/\n/g, ' ');
				
				if (!text) continue;

				mappedTranscript.push({
					text,
					offset: start,
					duration: end - start,
					lang: selectedCaption.languageCode
				});
			}

			if (mappedTranscript.length > 0) {
				return { rawTranscript: mappedTranscript, finalLang: selectedCaption.languageCode };
			}
		} catch (err) {
			// Ignore instance error, try next
			continue;
		}
	}
	throw new Error('Żaden serwer Invidious nie był w stanie pobrać transkrypcji (zbyt wiele zapytań lub brak dostępności).');
}

export async function fetchTranscriptWithFallback(
	videoId: string,
	preferredLangs: string[] = ['pl', 'en']
): Promise<FetchTranscriptResult> {
	try {
		let rawTranscript;
		let finalLang = preferredLangs.length > 0 ? preferredLangs[0] : 'en';
		let isFallback = false;

		// ETAP 1: Próba pobrania standardowo przez youtube-transcript
		try {
			// 1. Próbujemy pobrać w pierwszym preferowanym języku (np. 'pl')
			try {
				rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: preferredLangs[0] });
				finalLang = preferredLangs[0];
			} catch (err) {
				// 2. Jeśli się nie uda, próbujemy drugi język (np. 'en')
				if (preferredLangs.length > 1) {
					try {
						rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: preferredLangs[1] });
						finalLang = preferredLangs[1];
					} catch (err2) {
						// 3. Jeśli i to się nie uda, pobieramy JAKIKOLWIEK domyślny język, który jest na wideo
						rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
						finalLang = 'domyślny';
					}
				} else {
					// 3. Brak drugiego języka - pobieramy jakikolwiek domyślny
					rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
					finalLang = 'domyślny';
				}
			}
		} catch (primaryErr: unknown) {
			// BŁĄD! Prawdopodobnie blokada Vercel (Error 429)
			console.log('Główne API zawiodło, przełączam na Fallback Invidious...');
			isFallback = true;
		}

		let mappedTranscript: TranscriptResponse[] = [];

		if (!isFallback && rawTranscript && rawTranscript.length > 0) {
			mappedTranscript = rawTranscript.map((seg) => ({
				text: seg.text,
				offset: seg.offset,
				duration: seg.duration,
				lang: finalLang
			}));
		} else {
			// ETAP 2: Pobieranie przez otwarte serwery Invidious (Fallback)
			const invidiousResult = await fetchInvidiousTranscript(videoId, preferredLangs);
			mappedTranscript = invidiousResult.rawTranscript;
			finalLang = invidiousResult.finalLang;
		}

		if (!mappedTranscript || mappedTranscript.length === 0) {
			throw new Error('Transkrypcja po sparsowaniu okazała się pusta.');
		}

		return {
			rawTranscript: mappedTranscript,
			language: finalLang,
			rapidApiUsage: undefined
		};
	} catch (err: unknown) {
		console.error("Szczegóły błędu:", err);
		const errorMessage = err instanceof Error ? err.message : 'Nieoczekiwany błąd';
		throw new Error(errorMessage);
	}
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
		const data = await res.json() as any;
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
