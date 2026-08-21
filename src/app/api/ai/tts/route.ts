import { NextRequest, NextResponse } from 'next/server';
import { getUserAccess } from '@/lib/auth';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function escapeSsmlText(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest) {
	try {
		const access = await getUserAccess(req);

		if (!access.userId) {
			return NextResponse.json(
				{
					error:
						'Dostęp ograniczony. Zaloguj się, aby generować pliki audio MP3.',
				},
				{ status: 401 }
			);
		}

		const { text, language = 'pl' } = await req.json();

		if (!text) {
			return NextResponse.json(
				{ error: 'Brak wymaganego pola: text.' },
				{ status: 400 }
			);
		}

		const voiceMap: Record<string, { voice: string; lang: string }> = {
			pl: { voice: 'pl-PL-ZofiaNeural', lang: 'pl-PL' },
			en: { voice: 'en-US-JennyNeural', lang: 'en-US' },
			de: { voice: 'de-DE-KatjaNeural', lang: 'de-DE' },
			es: { voice: 'es-ES-ElviraNeural', lang: 'es-ES' },
			fr: { voice: 'fr-FR-DeniseNeural', lang: 'fr-FR' },
		};

		const voiceConfig = voiceMap[language] || voiceMap.pl;

		const tts = new EdgeTTS({
			voice: voiceConfig.voice,
			lang: voiceConfig.lang,
			outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
		});

		const randomId = crypto.randomBytes(8).toString('hex');
		const tempFilePath = path.join(os.tmpdir(), `tts-${randomId}.mp3`);
		const safeText = escapeSsmlText(text);

		try {
			await tts.ttsPromise(safeText, tempFilePath);
			const audioBuffer = fs.readFileSync(tempFilePath);

			if (fs.existsSync(tempFilePath)) {
				fs.unlinkSync(tempFilePath);
			}

			return new NextResponse(audioBuffer, {
				status: 200,
				headers: {
					'Content-Type': 'audio/mpeg',
					'Content-Disposition': 'attachment; filename="podsumowanie-ai.mp3"',
					'Content-Length': audioBuffer.length.toString(),
				},
			});
		} catch (ttsErr: unknown) {
			if (fs.existsSync(tempFilePath)) {
				fs.unlinkSync(tempFilePath);
			}
			throw ttsErr;
		}
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.stack || err.message : String(err);
		console.error('[/api/ai/tts] Error details:', err);
		return NextResponse.json(
			{ error: `Błąd generowania audio MP3: ${message}` },
			{ status: 500 }
		);
	}
}
