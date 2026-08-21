import { NextRequest, NextResponse } from 'next/server';
import { getUserAccess } from '@/lib/auth';
import { checkAndUpdateDailyLimit } from '@/lib/rateLimit';
import { getOpenAIClient } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const access = await getUserAccess(req);
		if (!access.userId) {
			return NextResponse.json(
				{ error: 'Zaloguj się, aby korzystać z generowania analiz AI.' },
				{ status: 401 }
			);
		}

		if (!access.isAdmin && !access.isPro) {
			const limitCheck = await checkAndUpdateDailyLimit(
				access.userId,
				access.publicMetadata
			);
			if (!limitCheck.allowed) {
				return NextResponse.json(
					{ error: limitCheck.message },
					{ status: 429 }
				);
			}
		}

		const {
			model,
			transcriptText,
			promptPreset,
			language = 'pl',
		} = await req.json();

		if (!transcriptText || !promptPreset) {
			return NextResponse.json(
				{ error: 'Brak wymaganych pól: transcriptText lub promptPreset.' },
				{ status: 400 }
			);
		}

		const languageInstructions: Record<string, string> = {
			pl: 'odpowiadaj po polsku',
			en: 'respond in English',
			de: 'respond in German',
			es: 'respond in Spanish',
			fr: 'respond in French',
		};
		const targetLanguageInstruction =
			languageInstructions[language] || `respond in ${language}`;

		const openai = getOpenAIClient();
		const defaultModel = 'openrouter/free';
		const response = await openai.chat.completions.create({
			model: model || defaultModel,
			messages: [
				{
					role: 'system',
					content: `Jesteś ekspertem od analizy i streszczania transkrypcji wideo. Twoim jedynym celem jest przeanalizowanie podanego tekstu z wideo i wygenerowanie wartościowego podsumowania. Zawsze:
								- ${targetLanguageInstruction},
								- używaj czytelnego formatu,
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
