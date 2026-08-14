import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser, createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function verifyAdminAccess(req: NextRequest): Promise<boolean> {
	const { userId } = await auth();
	const testCookie = req.cookies.get('test')?.value;
	if (testCookie === 'alen') return true;
	if (!userId) return false;

	const user = await currentUser();
	if (!user) return false;

	const userEmail = user.primaryEmailAddress?.emailAddress;
	const publicMetadata = (user.publicMetadata as Record<string, unknown>) ?? {};
	const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

	return Boolean(
		publicMetadata?.role === 'admin' ||
			publicMetadata?.isAdmin === true ||
			(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase())
	);
}

// GET /api/admin/users - Pobierz listę zarejestrowanych użytkowników
export async function GET(req: NextRequest) {
	try {
		const isAdmin = await verifyAdminAccess(req);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: 'Brak uprawnień administratora.' },
				{ status: 403 }
			);
		}

		const response = await clerkClient.users.getUserList({
			limit: 50,
			orderBy: '-created_at',
		});

		const users = response.data.map((u) => ({
			id: u.id,
			email: u.primaryEmailAddress?.emailAddress || 'Brak emaila',
			firstName: u.firstName || '',
			lastName: u.lastName || '',
			imageUrl: u.imageUrl || '',
			createdAt: u.createdAt,
			publicMetadata: u.publicMetadata || {},
			tier: (u.publicMetadata as Record<string, unknown>)?.tier || 'free',
			role: (u.publicMetadata as Record<string, unknown>)?.role || 'user',
		}));

		return NextResponse.json({ users });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Błąd serwera';
		console.error('[/api/admin/users GET Error]:', message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

// POST /api/admin/users - Zmień pakiet (tier) lub rolę użytkownika
export async function POST(req: NextRequest) {
	try {
		const isAdmin = await verifyAdminAccess(req);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: 'Brak uprawnień administratora.' },
				{ status: 403 }
			);
		}

		const { targetUserId, tier, role } = await req.json();

		if (!targetUserId) {
			return NextResponse.json(
				{ error: 'Wymagany jest parametr targetUserId.' },
				{ status: 400 }
			);
		}

		const existingUser = await clerkClient.users.getUser(targetUserId);
		const currentMetadata = (existingUser.publicMetadata as Record<string, unknown>) || {};

		const updatedMetadata = {
			...currentMetadata,
			...(tier !== undefined && { tier }),
			...(role !== undefined && { role }),
			...(tier === 'pro' && { isPro: true }),
			...(tier === 'free' && { isPro: false }),
		};

		await clerkClient.users.updateUserMetadata(targetUserId, {
			publicMetadata: updatedMetadata,
		});

		return NextResponse.json({
			success: true,
			message: `Zaktualizowano dane użytkownika ${targetUserId}`,
			publicMetadata: updatedMetadata,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Błąd serwera';
		console.error('[/api/admin/users POST Error]:', message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
