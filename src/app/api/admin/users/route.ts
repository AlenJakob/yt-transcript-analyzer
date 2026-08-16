import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { formatClerkUser } from '@/utils/helper';
import { verifyAdminAccess } from '@/lib/auth';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

export const dynamic = 'force-dynamic';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const ALLOWED_ROLES = ['admin', 'user'] as const;
const ALLOWED_TIERS = ['pro', 'free'] as const;

type Role = (typeof ALLOWED_ROLES)[number];
type Tier = (typeof ALLOWED_TIERS)[number];

// GET /api/admin/users - Pobierz listę zarejestrowanych użytkowników
export async function GET(req: NextRequest) {
	try {
		const access = await verifyAdminAccess(req);

		if (!access.isAdmin) {
			return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 403 });
		}

		const response = await clerkClient.users.getUserList({
			limit: 50,
			orderBy: '-created_at',
		});

		const users = response.data.map((user) => formatClerkUser(user));

		return NextResponse.json({ users });
	} catch (err: unknown) {
		const errMsg = err instanceof Error ? err.message : String(err);
		console.error('[/api/admin/users GET Error]:', err);
		return NextResponse.json(
			{ error: `Błąd serwera przy pobieraniu użytkowników: ${errMsg}` },
			{ status: 500 }
		);
	}
}

// POST /api/admin/users - Zmień pakiet (tier) lub rolę użytkownika
export async function POST(req: NextRequest) {
	try {
		const { isAdmin, currentUserId } = await verifyAdminAccess(req);
		if (!isAdmin) {
			return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 403 });
		}

		const body = await req.json().catch(() => null);
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Nieprawidłowe ciało żądania (JSON).' }, { status: 400 });
		}

		const { targetUserId, tier, role } = body as {
			targetUserId?: string;
			tier?: unknown;
			role?: unknown;
		};

		if (!targetUserId || typeof targetUserId !== 'string') {
			return NextResponse.json(
				{ error: 'Wymagany jest poprawny parametr targetUserId.' },
				{ status: 400 }
			);
		}

		// 1. Walidacja wartości role i tier (whitelisting)
		if (role !== undefined && !ALLOWED_ROLES.includes(role as Role)) {
			return NextResponse.json(
				{ error: `Niepoprawna rola. Dozwolone wartości to: ${ALLOWED_ROLES.join(', ')}.` },
				{ status: 400 }
			);
		}

		if (tier !== undefined && !ALLOWED_TIERS.includes(tier as Tier)) {
			return NextResponse.json(
				{ error: `Niepoprawny pakiet. Dozwolone wartości to: ${ALLOWED_TIERS.join(', ')}.` },
				{ status: 400 }
			);
		}

		// 2. Zabezpieczenie: Admin nie może odebrać sobie uprawnień
		if (targetUserId === currentUserId) {
			if (role && role !== 'admin') {
				return NextResponse.json(
					{ error: 'Nie możesz odebrać sobie uprawnień administratora.' },
					{ status: 400 }
				);
			}
			if (tier && tier !== 'pro') {
				return NextResponse.json(
					{ error: 'Nie możesz odebrać sobie pakietu PRO z poziomu panelu.' },
					{ status: 400 }
				);
			}
		}

		// 3. Weryfikacja czy użytkownik istnieje w Clerk (obsługa 404)
		let existingUser;
		try {
			existingUser = await clerkClient.users.getUser(targetUserId);
		} catch (clerkErr: unknown) {
			const isNotFound =
				(isClerkAPIResponseError(clerkErr) && clerkErr.status === 404) ||
				(clerkErr instanceof Error && clerkErr.message.toLowerCase().includes('not found'));

			if (isNotFound) {
				return NextResponse.json(
					{ error: 'Nie znaleziono użytkownika o podanym ID.' },
					{ status: 404 }
				);
			}
			throw clerkErr;
		}

		const updatedMetadata: Record<string, unknown> = {
			...((existingUser.publicMetadata as Record<string, unknown>) || {}),
		};

		if (role) {
			updatedMetadata.role = role;
			updatedMetadata.isAdmin = role === 'admin';
		}

		if (tier) {
			updatedMetadata.tier = tier;
			updatedMetadata.isPro = tier === 'pro';
		}

		await clerkClient.users.updateUserMetadata(targetUserId, {
			publicMetadata: updatedMetadata,
		});

		return NextResponse.json({
			success: true,
			message: `Zaktualizowano dane użytkownika ${targetUserId}`,
			publicMetadata: updatedMetadata,
		});
	} catch (err: unknown) {
		console.error('[/api/admin/users POST Error]:', err);
		return NextResponse.json({ error: 'Wystąpił wewnętrzny błąd serwera.' }, { status: 500 });
	}
}
