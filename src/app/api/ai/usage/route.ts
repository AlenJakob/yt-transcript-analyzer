import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/auth';
import { getOpenRouterApiKey, getOpenRouterBaseUrl } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	try {
		const { isAdmin } = await verifyAdminAccess(req);

		if (!isAdmin) {
			return NextResponse.json({ error: 'Brak uprawnień.' }, { status: 403 });
		}

		const apiKey = getOpenRouterApiKey();
		const baseUrl = getOpenRouterBaseUrl();
		const url = `${baseUrl}/auth/key`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Wystąpił błąd.';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
