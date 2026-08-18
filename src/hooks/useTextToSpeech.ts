import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTextToSpeechReturn {
	isSpeaking: boolean;
	isPaused: boolean;
	isLoading: boolean;
	rate: number;
	setRate: (rate: number) => void;
	speak: (text: string, langCode?: string) => void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	toggle: (text: string, langCode?: string) => void;
	isSupported: boolean;
}

function selectBestVoice(langCode: string): SpeechSynthesisVoice | null {
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
		return null;
	}

	const voices = window.speechSynthesis.getVoices();
	if (!voices || voices.length === 0) {
		return null;
	}

	const langMap: Record<string, string> = {
		pl: 'pl-PL',
		en: 'en-US',
		de: 'de-DE',
		es: 'es-ES',
		fr: 'fr-FR',
	};
	const targetLang = (langMap[langCode] || langCode).toLowerCase();
	const shortLang = targetLang.split('-')[0];

	const matchingVoices = voices.filter((v) =>
		v.lang.toLowerCase().startsWith(shortLang)
	);
	if (matchingVoices.length === 0) {
		return null;
	}

	const naturalVoice = matchingVoices.find((v) => {
		const name = v.name.toLowerCase();
		return (
			name.includes('natural') ||
			name.includes('google') ||
			name.includes('neural') ||
			name.includes('online') ||
			name.includes('premium')
		);
	});

	return naturalVoice || matchingVoices[0];
}

export function useTextToSpeech(): UseTextToSpeechReturn {
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSupported] = useState<boolean>(() => {
		return typeof window !== 'undefined' && 'speechSynthesis' in window;
	});

	const [rate, setRateState] = useState<number>(() => {
		if (typeof window !== 'undefined') {
			const savedRate = localStorage.getItem('yt_analyzer_tts_rate');
			if (savedRate) {
				const parsed = parseFloat(savedRate);
				if (!isNaN(parsed)) return parsed;
			}
		}
		return 0.95;
	});

	const setRate = useCallback((newRate: number) => {
		setRateState(newRate);
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_analyzer_tts_rate', newRate.toString());
		}
	}, []);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.getVoices();
			window.speechSynthesis.onvoiceschanged = () => {
				window.speechSynthesis.getVoices();
			};
		}
	}, []);

	useEffect(() => {
		return () => {
			if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	const stop = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel();
			setIsLoading(false);
			setIsSpeaking(false);
			setIsPaused(false);
		}
	}, []);

	const pause = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.pause();
			setIsPaused(true);
		}
	}, []);

	const resume = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.resume();
			setIsPaused(false);
		}
	}, []);

	const speak = useCallback(
		(text: string, langCode: string = 'pl') => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
				return;
			}

			window.speechSynthesis.cancel();
			setIsLoading(true);

			const utterance = new SpeechSynthesisUtterance(text);
			utteranceRef.current = utterance;

			const langMap: Record<string, string> = {
				pl: 'pl-PL',
				en: 'en-US',
				de: 'de-DE',
				es: 'es-ES',
				fr: 'fr-FR',
			};
			utterance.lang = langMap[langCode] || langCode;

			const bestVoice = selectBestVoice(langCode);
			if (bestVoice) {
				utterance.voice = bestVoice;
			}
			utterance.rate = rate;
			utterance.pitch = 1.0;

			utterance.onstart = () => {
				setIsLoading(false);
				setIsSpeaking(true);
				setIsPaused(false);
			};

			utterance.onend = () => {
				setIsLoading(false);
				setIsSpeaking(false);
				setIsPaused(false);
			};

			utterance.onerror = () => {
				setIsLoading(false);
				setIsSpeaking(false);
				setIsPaused(false);
			};

			window.speechSynthesis.speak(utterance);
		},
		[rate]
	);

	const toggle = useCallback(
		(text: string, langCode: string = 'pl') => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
				return;
			}

			if (window.speechSynthesis.speaking) {
				if (window.speechSynthesis.paused) {
					window.speechSynthesis.resume();
					setIsPaused(false);
				} else {
					window.speechSynthesis.pause();
					setIsPaused(true);
				}
			} else {
				speak(text, langCode);
			}
		},
		[speak]
	);

	return {
		isSpeaking,
		isPaused,
		isLoading,
		rate,
		setRate,
		speak,
		pause,
		resume,
		stop,
		toggle,
		isSupported,
	};
}
