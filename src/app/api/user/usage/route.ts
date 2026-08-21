import { NextRequest, NextResponse } from 'next/server';
import { getUserAccess } from '@/lib/auth';
import { MAX_DEMO_GENERATIONS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/usage
 * Returns current user's active tier, unlimited status, and remaining daily generation quota.
 */
export async function GET(req: NextRequest) {
	try {
		const access = await getUserAccess(req);

		if (!access.userId) {
			return NextResponse.json(
				{ error: 'Niezalogowany użytkownik.' },
				{ status: 401 }
			);
		}

		const isUnlimited = access.isAdmin || access.isPro;
		const today = new Date().toISOString().split('T')[0];
		const usage = (access.publicMetadata.dailyUsage as { date?: string; remainingGenerations?: number }) || {};

		let remaining = usage.remainingGenerations;
		if (usage.date !== today || typeof remaining !== 'number') {
			remaining = MAX_DEMO_GENERATIONS;
		}

		return NextResponse.json({
			tier: access.tier,
			role: access.isAdmin ? 'admin' : 'user',
			remaining: isUnlimited ? null : remaining,
			limit: isUnlimited ? null : MAX_DEMO_GENERATIONS,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		console.error('[/api/user/usage GET Error]:', err);
		return NextResponse.json(
			{ error: `Błąd odczytu limitu użytkownika: ${message}` },
			{ status: 500 }
		);
	}
}
