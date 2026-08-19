import { NextResponse } from 'next/server';

export async function GET() {
	const url = 'https://openrouter.ai/api/v1/models';
	try {
		const resp = await fetch(url);

		if (!resp.ok) {
			throw new Error('OpenRouter API error');
		}

		const data = await resp.json();
		const freeModels = data.data.filter((model: { id: string }) => {
			const id = model.id.toLowerCase();
			return (
				id.endsWith(':free') &&
				!id.includes('guard') &&
				!id.includes('moderation') &&
				!id.includes('safety')
			);
		});

		return NextResponse.json({ models: { freeModels } });
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				error: 'Nie udało się pobrać modeli',
			},
			{
				status: 500,
			}
		);
	}
}
