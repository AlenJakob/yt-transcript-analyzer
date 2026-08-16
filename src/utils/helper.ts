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
