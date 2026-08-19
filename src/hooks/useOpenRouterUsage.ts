import { useState, useEffect, useCallback } from 'react';
import {
	OpenRouterUsageData,
	formatOpenRouterUsage,
	FormattedUsageInfo,
} from '@/utils/helper';

export interface UseOpenRouterUsageReturn {
	usageData: OpenRouterUsageData | null;
	formattedInfo: FormattedUsageInfo;
	isLoading: boolean;
	error: string | null;
	refreshUsage: () => Promise<void>;
}

export function useOpenRouterUsage(isAdmin: boolean): UseOpenRouterUsageReturn {
	const [usageData, setUsageData] = useState<OpenRouterUsageData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUsage = useCallback(async () => {
		if (!isAdmin) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/ai/usage');
			if (!response.ok) {
				throw new Error('Nie udało się pobrać danych zużycia OpenRouter API.');
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
		fetchUsage();
	}, [fetchUsage]);

	const formattedInfo: FormattedUsageInfo = formatOpenRouterUsage(
		usageData || undefined
	);

	return {
		usageData,
		formattedInfo,
		isLoading,
		error,
		refreshUsage: fetchUsage,
	};
}
