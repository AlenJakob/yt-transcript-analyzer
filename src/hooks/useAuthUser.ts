'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export interface AuthUserInfo {
	isLoaded: boolean;
	isSignedIn: boolean;
	userId: string | null;
	userEmail: string | null;
	fullName: string | null;
	imageUrl: string | null;
	publicMetadata: Record<string, unknown>;
	isPro: boolean;
	isAdmin: boolean;
}

export function useAuthUser(): AuthUserInfo {
	const { isLoaded: isAuthLoaded, userId } = useAuth();
	const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();

	const isLoaded = isAuthLoaded && isUserLoaded;

	const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
	const fullName = user?.fullName ?? user?.firstName ?? null;
	const imageUrl = user?.imageUrl ?? null;
	const publicMetadata = (user?.publicMetadata as Record<string, unknown>) ?? {};

	const isPro = Boolean(publicMetadata?.tier === 'pro' || publicMetadata?.isPro === true);

	const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
	const isAdmin = Boolean(
		publicMetadata?.role === 'admin' ||
			publicMetadata?.isAdmin === true ||
			(adminEmail && userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase())
	);

	return {
		isLoaded,
		isSignedIn: Boolean(isSignedIn),
		userId: userId ?? null,
		userEmail,
		fullName,
		imageUrl,
		publicMetadata,
		isPro,
		isAdmin,
	};
}
