import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(req: NextRequest) {
	try {
		const { isAdmin } = await verifyAdminAccess(req);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: 'Brak uprawnień. Tylko dla administratorów.' },
				{ status: 403 }
			);
		}

		const rapidApiKey = process.env.RAPIDAPI_KEY;
		const rapidApiHost = process.env.RAPIDAPI_HOST || 'youtube-transcripts.p.rapidapi.com';

		if (!rapidApiKey) {
			return NextResponse.json({ error: 'Brak klucza RapidAPI.' }, { status: 400 });
		}

		// Robimy lekkie zapytanie na fikcyjne ID wideo żeby zczytać headery rate limitu.
		// Jeśli API rzuci błąd 400/404 z powodu braku wideo, headery ratelimitów i tak są często zwracane.
		const url = `https://${rapidApiHost}/youtube/transcript?videoId=USAGE_CHECK_ONLY`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'x-rapidapi-key': rapidApiKey,
				'x-rapidapi-host': rapidApiHost,
				'Content-Type': 'application/json',
			},
		});

		const limit = res.headers.get('x-ratelimit-requests-limit') || null;
		const remaining = res.headers.get('x-ratelimit-requests-remaining') || null;

		return NextResponse.json({
			data: {
				limit,
				remaining,
			},
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd.';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
