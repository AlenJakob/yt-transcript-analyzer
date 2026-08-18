import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAiSummaryReturn {
	aiResponse: string;
	isAiLoading: boolean;
	error: string | null;
	generateSummary: (
		transcriptText: string,
		selectedModel: string,
		promptPreset?: string,
		language?: string
	) => Promise<void>;
	abort: () => void;
	reset: () => void;
}

export function useAiSummary(): UseAiSummaryReturn {
	const [aiResponse, setAiResponse] = useState<string>('');
	const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const abort = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const reset = useCallback(() => {
		setAiResponse('');
		setError(null);
	}, []);

	const generateSummary = useCallback(
		async (
			transcriptText: string,
			selectedModel: string,
			promptPreset: string = 'Przeanalizuj poniższą transkrypcję i stwórz streszczenie. Zbierz najważniejsze informacje, nie pomijaj istotnych szczegółów',
			language: string = 'pl'
		) => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				setIsAiLoading(true);
				setError(null);
				setAiResponse('');

				const resp = await fetch('/api/ai', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
					body: JSON.stringify({
						model: selectedModel,
						transcriptText,
						promptPreset,
						language,
					}),
				});

				if (!resp.ok) {
					const errorData = await resp.json().catch(() => null);
					const serverMsg = errorData?.error;
					throw new Error(serverMsg || `Błąd serwera: ${resp.status}`);
				}

				const data = await resp.json();
				setAiResponse(data?.result || '');
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') {
					console.log('Generowanie AI zostało anulowane.');
				} else {
					const errorMsg = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
					console.error('AI Error:', err);
					setError(errorMsg);
				}
			} finally {
				setIsAiLoading(false);
				if (abortControllerRef.current === controller) {
					abortControllerRef.current = null;
				}
			}
		},
		[]
	);

	return {
		aiResponse,
		isAiLoading,
		error,
		generateSummary,
		abort,
		reset,
	};
}
