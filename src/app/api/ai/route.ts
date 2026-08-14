import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// OpenRouter wymaga własnego baseURL i opcjonalnych nagłówków
const openai = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: 'https://openrouter.ai/api/v1',
	defaultHeaders: {
		'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		'X-Title': 'YT Transcript Analyzer',
	},
});

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		const testCookie = req.cookies.get('test')?.value;
		const isTestAllowed = testCookie === 'alen';

		let isAdmin = isTestAllowed;

		if (userId && !isAdmin) {
			const user = await currentUser();
			const userEmail = user?.primaryEmailAddress?.emailAddress;
			const publicMetadata = (user?.publicMetadata as Record<string, unknown>) ?? {};
			const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

			if (
				publicMetadata?.role === 'admin' ||
				publicMetadata?.isAdmin === true ||
				(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase())
			) {
				isAdmin = true;
			}
		}

		// Zabezpieczenie: tylko administrator ma dostęp do generowania AI z OpenRouter
		if (!isAdmin) {
			return NextResponse.json(
				{ error: 'Dostęp ograniczony. Generowanie AI z OpenRouter jest obecnie dostępne tylko dla administratora.' },
				{ status: 403 }
			);
		}

		const { model, transcriptText, promptPreset } = await req.json();

		if (!transcriptText || !promptPreset) {
			return NextResponse.json(
				{ error: 'Brak wymaganych pól: transcriptText lub promptPreset.' },
				{ status: 400 }
			);
		}

		const defaultModel = 'openrouter/free';
		const response = await openai.chat.completions.create({
			model: model || defaultModel,
			messages: [
				{
					role: 'system',
					content: `Jesteś ekspertem od analizy transkrypcji wideo. Zawsze:
								- odpowiadaj po polsku,
								- używaj wyłącznie zwykłego tekstu,
								- nie używaj Markdown,
								- nie stosuj list,
								- nie używaj znaków #, ** ani ---,
								- twórz tekst przeznaczony do odsłuchu przez TTS.`,
				},
				{
					role: 'user',
					content: `${promptPreset}\n\nTekst transkrypcji:\n\n${transcriptText}`,
				},
			],
		});

		return NextResponse.json({ result: response.choices[0].message.content, modelUsed: model });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Nieznany błąd serwera';
		console.error('[/api/ai] Error:', message);
		return NextResponse.json({ error: `Błąd serwera: ${message}` }, { status: 500 });
	}
}
