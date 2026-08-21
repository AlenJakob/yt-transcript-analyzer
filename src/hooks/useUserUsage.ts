'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserUsageInfo {
	tier: string;
	role: string;
	remaining: number | null;
	limit: number | null;
}

export function useUserUsage(isSignedIn: boolean) {
	const [usageInfo, setUsageInfo] = useState<UserUsageInfo | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUsage = useCallback(async () => {
		if (!isSignedIn) {
			setUsageInfo(null);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const res = await fetch('/api/user/usage');
			if (!res.ok) {
				throw new Error('Nie udało się pobrać limitu użytkownika.');
			}
			const data: UserUsageInfo = await res.json();
			setUsageInfo(data);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [isSignedIn]);

	useEffect(() => {
		fetchUsage();
	}, [fetchUsage]);

	return {
		usageInfo,
		isLoading,
		error,
		refreshUsage: fetchUsage,
	};
}
