import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Lazily creates and returns an OpenAI client instance configured for OpenRouter.
 */
function getOpenAIClient(): OpenAI {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error(
			'OPENROUTER_API_KEY environment variable is not configured.'
		);
	}

	return new OpenAI({
		apiKey,
		baseURL: 'https://openrouter.ai/api/v1',
		defaultHeaders: {
			'HTTP-Referer':
				process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			'X-Title': 'YT Transcript Analyzer',
		},
	});
}

export async function POST(req: NextRequest) {
	try {
		const { isAdmin } = await verifyAdminAccess(req);

		// Guard: only administrator has access to generate AI with OpenRouter
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

		const openai = getOpenAIClient();
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
