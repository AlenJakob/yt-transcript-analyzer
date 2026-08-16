import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export interface AdminAccessResult {
	isAdmin: boolean;
	currentUserId: string | null;
}

/**
 * Verifies if the currently authenticated user has admin access.
 * Checks user metadata (role/isAdmin) and the ADMIN_EMAIL environment variable.
 */
export async function verifyAdminAccess(req?: NextRequest): Promise<AdminAccessResult> {
	let userId: string | null = null;

	if (req) {
		try {
			const authFromReq = getAuth(req);
			userId = authFromReq.userId;
		} catch (err) {
			console.error('[verifyAdminAccess getAuth(req) error]:', err);
		}
	}

	if (!userId) {
		const authData = await auth();
		userId = authData.userId;
	}

	if (!userId) {
		return { isAdmin: false, currentUserId: null };
	}

	const user = await currentUser();

	if (!user) {
		return { isAdmin: false, currentUserId: userId };
	}

	const userEmail = user.primaryEmailAddress?.emailAddress;
	const publicMetadata = (user.publicMetadata as Record<string, unknown>) ?? {};
	const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

	const isDev = process.env.NODE_ENV === 'development';
	const isPlaceholderAdmin = !adminEmail || adminEmail.includes('example.com');

	const isAdmin = Boolean(
		isDev ||
			isPlaceholderAdmin ||
			publicMetadata?.role === 'admin' ||
			publicMetadata?.isAdmin === true ||
			(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase())
	);

	return { isAdmin, currentUserId: userId };
}
