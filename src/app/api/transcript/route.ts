export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/auth';
import {
	extractYouTubeVideoId,
	fetchVideoMetadata,
	formatTimestamp,
	calculateTranscriptStats,
	TranscriptSegment,
	fetchTranscriptWithFallback,
} from '@/lib/youtube';
import { decodeHtmlEntities, normalizeTime } from '@/utils/helper';

export async function POST(req: NextRequest) {
	try {
		const { isAdmin } = await verifyAdminAccess(req);
		if (!isAdmin) {
			return NextResponse.json(
				{
					error:
						'Tylko administratorzy mogą obecnie pobierać nowe transkrypcje.',
				},
				{ status: 403 }
			);
		}

		const body = await req.json();
		const { url, preferredLanguage } = body;

		if (!url) {
			return NextResponse.json(
				{ error: 'Brak podanego adresu URL lub Video ID.' },
				{ status: 400 }
			);
		}

		const videoId = extractYouTubeVideoId(url);
		if (!videoId) {
			return NextResponse.json(
				{
					error: 'Nieprawidłowy adres URL filmu YouTube. Podaj poprawny link.',
				},
				{ status: 400 }
			);
		}

		const metadata = await fetchVideoMetadata(videoId);

		let preferredLangs = ['pl', 'en'];
		if (preferredLanguage === 'en') {
			preferredLangs = ['en', 'pl'];
		} else if (preferredLanguage === 'auto') {
			preferredLangs = [];
		}

		try {
			const { rawTranscript, language } = await fetchTranscriptWithFallback(
				videoId,
				preferredLangs
			);

			const segments: TranscriptSegment[] = rawTranscript.map((item) => {
				const offset = normalizeTime(item.offset);
				return {
					text: decodeHtmlEntities(item.text),
					offset,
					duration: normalizeTime(item.duration),
					timestamp: formatTimestamp(offset),
				};
			});

			const stats = calculateTranscriptStats(segments);

			return NextResponse.json({
				success: true,
				metadata,
				segments,
				stats,
				language,
			});
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Brak dostępnych napisów';
			return NextResponse.json(
				{
					error: `Nie udało się pobrać transkrypcji dla tego filmu. Upewnij się, że film posiada włączone napisy. (${errorMessage})`,
					metadata,
				},
				{ status: 404 }
			);
		}
	} catch (error: unknown) {
		const errMessage =
			error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
		return NextResponse.json(
			{ error: `Błąd serwera: ${errMessage}` },
			{ status: 500 }
		);
	}
}
