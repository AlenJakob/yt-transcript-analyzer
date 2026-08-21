import { createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
});

export const MAX_DEMO_GENERATIONS = 5;

export interface DailyLimitCheckResult {
	allowed: boolean;
	remainingGenerations: number;
	message?: string;
}

/**
 * Checks and decrements daily generation limit for DEMO/Basic users using Clerk publicMetadata.
 * Resets counter to MAX_DEMO_GENERATIONS (5) at midnight (new YYYY-MM-DD date).
 */
export async function checkAndUpdateDailyLimit(
	userId: string,
	publicMetadata: Record<string, unknown>
): Promise<DailyLimitCheckResult> {
	const today = new Date().toISOString().split('T')[0];
	const usage =
		(publicMetadata.dailyUsage as {
			date?: string;
			remainingGenerations?: number;
		}) || {};

	// Reset counter if it's a new day or initial call
	let currentRemaining = usage.remainingGenerations;
	if (usage.date !== today || typeof currentRemaining !== 'number') {
		currentRemaining = MAX_DEMO_GENERATIONS;
	}

	if (currentRemaining <= 0) {
		return {
			allowed: false,
			remainingGenerations: 0,
			message: `Osiągnięto dzienny limit (${MAX_DEMO_GENERATIONS}/${MAX_DEMO_GENERATIONS}) w planie DEMO. Odnowienie limitu nastąpi o północy.`,
		};
	}

	// Decrement by 1
	const nextRemaining = currentRemaining - 1;

	// Save updated usage to Clerk publicMetadata
	try {
		await clerkClient.users.updateUserMetadata(userId, {
			publicMetadata: {
				...publicMetadata,
				dailyUsage: {
					date: today,
					remainingGenerations: nextRemaining,
				},
			},
		});
	} catch (err) {
		console.error('[RateLimit Metadata Update Error]:', err);
	}

	return {
		allowed: true,
		remainingGenerations: nextRemaining,
	};
}
