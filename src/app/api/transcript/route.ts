import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import {
  extractYouTubeVideoId,
  fetchVideoMetadata,
  formatTimestamp,
  calculateTranscriptStats,
  TranscriptSegment,
} from '@/lib/youtube';
import { decodeHtmlEntities, normalizeTime } from '@/utils/helper';

interface RawTranscriptProps { text: string; duration: number; offset: number }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Brak podanego adresu URL lub Video ID.' },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    console.log('videoId', videoId)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Nieprawidłowy adres URL filmu YouTube. Podaj poprawny link (np. https://www.youtube.com/watch?v=...)' },
        { status: 400 }
      );
    }

    const metadata = await fetchVideoMetadata(videoId);
    console.log(metadata, 'Meta data fetchvIdeo')

    let rawTranscript: RawTranscriptProps[] = [];
    try {
      rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Brak dostępnych napisów';
      return NextResponse.json(
        {
          error: `Nie udało się pobrać transkrypcji dla tego filmu. Upewnij się, że film posiada włączone napisy (manualne lub automatyczne). (${errorMessage})`,
          metadata,
        },
        { status: 404 }
      );
    }

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
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
    return NextResponse.json(
      { error: `Błąd serwera: ${errMessage}` },
      { status: 500 }
    );
  }
}
