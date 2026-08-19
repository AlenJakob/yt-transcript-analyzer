import type { User } from '@clerk/nextjs/server';

const MILLISECONDS_IN_SECOND = 1_000;
const MILLISECOND_THRESHOLD = 10 * MILLISECONDS_IN_SECOND;

export const normalizeTime = (value: number): number =>
	value > MILLISECOND_THRESHOLD ? value / MILLISECONDS_IN_SECOND : value;

export const decodeHtmlEntities = (text: string): string =>
	text
		.replace(/&amp;/g, '&')
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');

export interface FormattedAdminUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	imageUrl: string;
	createdAt: number;
	publicMetadata: Record<string, unknown>;
	tier: string;
	role: string;
}

export function formatClerkUser(user: User): FormattedAdminUser {
	const publicMetadata = (user.publicMetadata as Record<string, unknown>) || {};
	return {
		id: user.id,
		email: user.primaryEmailAddress?.emailAddress || 'Brak emaila',
		firstName: user.firstName || '',
		lastName: user.lastName || '',
		imageUrl: user.imageUrl || '',
		createdAt: user.createdAt,
		publicMetadata,
		tier: (publicMetadata.tier as string) || 'free',
		role: (publicMetadata.role as string) || 'user',
	};
}

export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	if (isNaN(date.getTime())) {
		return isoString;
	}

	return date.toLocaleDateString('pl-PL', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export interface ProfileButtonStylesParams {
	isProfile: boolean;
	isAdmin: boolean;
	mode: 'light' | 'dark';
}

<<<<<<< HEAD
export function getProfileButtonStyles({
	isProfile,
	isAdmin,
	mode,
}: ProfileButtonStylesParams) {
=======
export function getProfileButtonStyles({ isProfile, isAdmin, mode }: ProfileButtonStylesParams) {
>>>>>>> a549b94 (feat: add text-to-speech hook, OpenRouter API integration, and associated UI components for usage tracking and transcript management.)
	const isDark = mode === 'dark';

	if (isProfile) {
		return {
			bgcolor: isAdmin ? (isDark ? '#9333ea' : '#7e22ce') : '#3b82f6',
			borderColor: '#3b82f6',
			color: '#ffffff',
			hoverBorderColor: isAdmin ? (isDark ? '#a855f7' : '#6b21a8') : '#2563eb',
		};
	}

	if (isAdmin) {
		return {
			bgcolor: 'transparent',
<<<<<<< HEAD
			borderColor: isDark
				? 'rgba(168, 85, 247, 0.35)'
				: 'rgba(126, 34, 206, 0.4)',
=======
			borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(126, 34, 206, 0.4)',
>>>>>>> a549b94 (feat: add text-to-speech hook, OpenRouter API integration, and associated UI components for usage tracking and transcript management.)
			color: isDark ? '#c084fc' : '#7e22ce',
			hoverBorderColor: isDark ? '#a855f7' : '#6b21a8',
		};
	}

	return {
		bgcolor: 'transparent',
		borderColor: 'divider',
		color: 'text.secondary',
		hoverBorderColor: '#3b82f6',
	};
}
<<<<<<< HEAD
=======

export interface OpenRouterUsageData {
	label?: string;
	usage?: number;
	limit?: number | null;
	limit_remaining?: number | null;
	is_free_tier?: boolean;
	usage_daily?: number;
	usage_weekly?: number;
	usage_monthly?: number;
	expires_at?: string | number | null;
}

export interface FormattedUsageInfo {
	totalUsageUsd: string;
	totalUsagePln: string;
	tierLabel: string;
	isFreeTier: boolean;
	limitLabel: string;
	keyLabel: string;
	expiresAtLabel: string;
}

export function formatOpenRouterUsage(data?: OpenRouterUsageData): FormattedUsageInfo {
	if (!data) {
		return {
			totalUsageUsd: '$0.0000',
			totalUsagePln: '0,0000 zł',
			tierLabel: 'Nieznany',
			isFreeTier: true,
			limitLabel: 'Brak danych',
			keyLabel: 'Brak klucza',
			expiresAtLabel: 'Brak danych',
		};
	}

	const usage = data.usage ?? 0;
	const usagePln = usage * 4.0;

	let expiresAtLabel = 'Bezterminowo';
	if (data.expires_at) {
		expiresAtLabel = formatDate(String(data.expires_at));
	}

	return {
		totalUsageUsd: `$${usage.toFixed(6)}`,
		totalUsagePln: `${usagePln.toFixed(4)} zł`,
		tierLabel: data.is_free_tier ? 'Plan Free (Darmowy)' : 'Plan Paid (Płatny)',
		isFreeTier: Boolean(data.is_free_tier),
		limitLabel: data.limit ? `$${data.limit}` : 'Brak limitu',
		keyLabel: data.label || 'Klucz Główny API',
		expiresAtLabel,
	};
}
>>>>>>> a549b94 (feat: add text-to-speech hook, OpenRouter API integration, and associated UI components for usage tracking and transcript management.)
