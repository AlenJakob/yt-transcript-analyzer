import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// OpenRouter wymaga własnego baseURL i opcjonalnych nagłówków
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "YT Transcript Analyzer",
    },
});

export async function POST(req: NextRequest) {
    try {
        // TODO: temporary authentication - refactor before deployment
        const testCookie = req.cookies.get("test")?.value;

        if (testCookie !== "alen") {
            return NextResponse.json(
                { error: "Brak autoryzacji." },
                { status: 401 }
            );
        }

        const { transcriptText, promptPreset } = await req.json();

        if (!transcriptText || !promptPreset) {
            return NextResponse.json(
                { error: "Brak wymaganych pól: transcriptText lub promptPreset." },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                { role: "system", content: "Jesteś ekspertem od analizy transkrypcji wideo." },
                { role: "user", content: `${promptPreset}\n\nTekst transkrypcji:\n\n${transcriptText}` },
            ],
        });

        return NextResponse.json({ result: response.choices[0].message.content });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Nieznany błąd serwera";
        console.error("[/api/ai] Error:", message);
        return NextResponse.json(
            { error: `Błąd serwera: ${message}` },
            { status: 500 }
        );
    }
}