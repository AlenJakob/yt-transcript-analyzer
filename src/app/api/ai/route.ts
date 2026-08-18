import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// OpenRouter wymaga własnego baseURL i opcjonalnych nagłówków
// TODO: Allow user-customizable OpenRouter API Key (currently non-configurable from UI, defaults to OPENROUTER_API_KEY env var)
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
		const { isAdmin } = await verifyAdminAccess(req);

		// Guard: tylko administrator ma dostęp do generowania AI z OpenRouter
		if (!isAdmin) {
			return NextResponse.json(
				{
					error:
						'Dostęp ograniczony. Generowanie AI z OpenRouter jest obecnie dostępne tylko dla administratora.',
				},
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

		return NextResponse.json({
			result: response.choices[0].message.content,
			modelUsed: model,
		});
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : 'Nieznany błąd serwera';
		console.error('[/api/ai] Error:', message);
		return NextResponse.json(
			{ error: `Błąd serwera: ${message}` },
			{ status: 500 }
		);
	}
}
