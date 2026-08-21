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

interface RawRapidApiSegment {
	start?: string | number;
	offset?: string | number;
	duration?: string | number;
	text?: string;
	transcript?: string;
	lang?: string;
}

import { YoutubeTranscript } from 'youtube-transcript';

export async function fetchTranscriptWithFallback(
	videoId: string,
	preferredLangs: string[] = ['pl', 'en']
): Promise<FetchTranscriptResult> {
	try {
		let finalLang = preferredLangs.length > 0 ? preferredLangs[0] : 'en';
		const isProd =
			process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

		console.log(`[fetchTranscript] Initiating fetch for video: ${videoId}`);
		console.log(
			`[fetchTranscript] Environment: isProd=${isProd} (NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL})`
		);

		// Helper: Pobieranie przez RapidAPI (dla Vercel / Prod)
		const fetchFromRapidApi = async (): Promise<TranscriptResponse[]> => {
			console.log(
				`[RapidAPI] Attempting to fetch transcript for video: ${videoId}`
			);
			const hasKey = Boolean(process.env.RAPIDAPI_KEY);
			console.log(`[RapidAPI] RAPIDAPI_KEY present: ${hasKey}`);

			if (!process.env.RAPIDAPI_KEY) {
				console.error(
					'[RapidAPI Error] RAPIDAPI_KEY environment variable is missing!'
				);
				throw new Error(
					'Brak klucza RAPIDAPI_KEY w środowisku Vercel / produkcyjnym.'
				);
			}

			const rapidApiHost =
				process.env.RAPIDAPI_HOST || 'youtube-transcripts.p.rapidapi.com';
			const url = `https://${rapidApiHost}/youtube/transcript?videoId=${videoId}`;
			console.log(
				`[RapidAPI] Fetching from URL: ${url} (Host: ${rapidApiHost})`
			);

			const options = {
				method: 'GET',
				headers: {
					'x-rapidapi-key': process.env.RAPIDAPI_KEY,
					'x-rapidapi-host': rapidApiHost,
				},
			};

			const res = await fetch(url, options);
			console.log(
				`[RapidAPI] Response HTTP Status: ${res.status} ${res.statusText}`
			);

			if (!res.ok) {
				const errorText = await res.text().catch(() => '');
				console.error(`[RapidAPI Error] HTTP ${res.status}:`, errorText);
				throw new Error(`RapidAPI zwróciło błąd HTTP: ${res.status}`);
			}

			const apiData = await res.json();
			console.log('[RapidAPI] JSON response received successfully');

			const transcriptData =
				apiData?.content ||
				apiData?.data?.transcript ||
				apiData?.data?.transcripts ||
				apiData?.data ||
				[];

			if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
				console.error(
					'[RapidAPI Error] Parsed transcript data is empty or not an array:',
					apiData
				);
				throw new Error(
					'RapidAPI nie zwróciło poprawnej tablicy z transkrypcją.'
				);
			}

			if (apiData?.lang) {
				finalLang = apiData.lang;
			}

			console.log(
				`[RapidAPI] Successfully parsed ${transcriptData.length} segments (lang: ${finalLang})`
			);

			return transcriptData.map((seg: RawRapidApiSegment) => {
				const rawOffset = parseFloat(String(seg.start ?? seg.offset ?? '0'));
				const rawDuration = parseFloat(String(seg.duration ?? '0'));
				return {
					text: seg.text || seg.transcript || '',
					offset: rawOffset > 10000 ? rawOffset / 1000 : rawOffset,
					duration: rawDuration > 10000 ? rawDuration / 1000 : rawDuration,
					lang: seg.lang || finalLang,
				};
			});
		};

		// Helper: Pobieranie przez darmową bibliotekę (dla Dev mode)
		const fetchFromYoutubeTranscript = async (): Promise<
			TranscriptResponse[]
		> => {
			console.log(
				`[YoutubeTranscript Library] Attempting to fetch for video: ${videoId}`
			);
			let raw;
			try {
				raw = await YoutubeTranscript.fetchTranscript(videoId, {
					lang: preferredLangs[0],
				});
				finalLang = preferredLangs[0];
			} catch {
				if (preferredLangs.length > 1) {
					try {
						raw = await YoutubeTranscript.fetchTranscript(videoId, {
							lang: preferredLangs[1],
						});
						finalLang = preferredLangs[1];
					} catch {
						raw = await YoutubeTranscript.fetchTranscript(videoId);
						finalLang = 'domyślny';
					}
				} else {
					raw = await YoutubeTranscript.fetchTranscript(videoId);
					finalLang = 'domyślny';
				}
			}

			return raw.map((seg) => ({
				text: seg.text,
				offset: seg.offset,
				duration: seg.duration,
				lang: finalLang,
			}));
		};

		let mappedTranscript: TranscriptResponse[] = [];

		// W produkcji (Vercel) używamy WYŁĄCZNIE RapidAPI.
		// W trybie dev (lokalnie) używamy paczki npm youtube-transcript, a RapidAPI jako fallback.
		if (isProd) {
			console.log('[fetchTranscript] Executing RapidAPI mode (PROD)...');
			mappedTranscript = await fetchFromRapidApi();
		} else {
			console.log(
				'[fetchTranscript] Executing YoutubeTranscript mode (DEV)...'
			);
			try {
				mappedTranscript = await fetchFromYoutubeTranscript();
			} catch (libErr) {
				console.log(
					'youtube-transcript w dev nie powiodło się, przełączam na RapidAPI:',
					libErr
				);
				mappedTranscript = await fetchFromRapidApi();
			}
		}

		if (!mappedTranscript || mappedTranscript.length === 0) {
			throw new Error('Transkrypcja po sparsowaniu okazała się pusta.');
		}

		return {
			rawTranscript: mappedTranscript,
			language: finalLang,
			rapidApiUsage: undefined,
		};
	} catch (err: unknown) {
		console.error('Szczegóły błędu fetchTranscriptWithFallback:', err);
		const errorMessage =
			err instanceof Error ? err.message : 'Nieoczekiwany błąd';
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
		const data = (await res.json()) as { title?: string; author_name?: string };
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
