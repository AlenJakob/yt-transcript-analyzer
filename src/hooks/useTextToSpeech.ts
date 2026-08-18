import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTextToSpeechReturn {
	isSpeaking: boolean;
	isPaused: boolean;
	speak: (text: string, langCode?: string) => void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	toggle: (text: string, langCode?: string) => void;
	isSupported: boolean;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [isSupported, setIsSupported] = useState<boolean>(false);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			setIsSupported(true);
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

	const speak = useCallback((text: string, langCode: string = 'pl') => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			return;
		}

		window.speechSynthesis.cancel();

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

		utterance.onstart = () => {
			setIsSpeaking(true);
			setIsPaused(false);
		};

		utterance.onend = () => {
			setIsSpeaking(false);
			setIsPaused(false);
		};

		utterance.onerror = () => {
			setIsSpeaking(false);
			setIsPaused(false);
		};

		window.speechSynthesis.speak(utterance);
	}, []);

	const toggle = useCallback((text: string, langCode: string = 'pl') => {
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
	}, [speak]);

	return {
		isSpeaking,
		isPaused,
		speak,
		pause,
		resume,
		stop,
		toggle,
		isSupported,
	};
}
