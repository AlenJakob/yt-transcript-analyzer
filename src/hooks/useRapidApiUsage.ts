import { useState, useEffect, useCallback } from 'react';

export interface RapidApiUsageData {
	limit: string | null;
	remaining: string | null;
}

export interface UseRapidApiUsageReturn {
	usageData: RapidApiUsageData | null;
	isLoading: boolean;
	error: string | null;
	refreshUsage: () => Promise<void>;
}

export function useRapidApiUsage(isAdmin: boolean): UseRapidApiUsageReturn {
	const [usageData, setUsageData] = useState<RapidApiUsageData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const refreshUsage = useCallback(async () => {
		if (!isAdmin) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/admin/rapidapi-usage');
			if (!response.ok) {
				throw new Error('Nie udało się pobrać danych zużycia RapidAPI.');
			}
			const json = await response.json();
			if (json.data) {
				setUsageData(json.data);
			} else if (json.error) {
				setError(json.error);
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [isAdmin]);

	useEffect(() => {
		if (isAdmin) {
			void refreshUsage();
		}
	}, [isAdmin, refreshUsage]);

	return {
		usageData,
		isLoading,
		error,
		refreshUsage,
	};
}
