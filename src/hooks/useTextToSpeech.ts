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

	const matchingVoices = voices.filter((voice) =>
		voice.lang.toLowerCase().startsWith(shortLang)
	);
	if (matchingVoices.length === 0) {
		return null;
	}

	const naturalVoice = matchingVoices.find((voice) => {
		const name = voice.name.toLowerCase();
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

function splitIntoSentences(text: string): string[] {
	if (!text) {
		return [];
	}
	const paragraphs = text.split('\n');
	const chunks: string[] = [];

	for (const paragraph of paragraphs) {
		const trimmedParagraph = paragraph.trim();
		if (!trimmedParagraph) {
			continue;
		}

		const sentences = trimmedParagraph.match(/[^.!?;\n]+[.!?;\n]*/g) || [trimmedParagraph];
		for (const sentence of sentences) {
			const trimmedSentence = sentence.trim();
			if (trimmedSentence.length > 0) {
				chunks.push(trimmedSentence);
			}
		}
	}

	return chunks.length > 0 ? chunks : [text];
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
				if (!isNaN(parsed)) {
					return parsed;
				}
			}
		}
		return 1.0;
	});

	const sentencesRef = useRef<string[]>([]);
	const sentenceIndexRef = useRef<number>(0);
	const langCodeRef = useRef<string>('pl');
	const isManualCancelRef = useRef<boolean>(false);
	const activeRateRef = useRef<number>(1.0);

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
				isManualCancelRef.current = true;
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	const stop = useCallback(() => {
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			isManualCancelRef.current = true;
			window.speechSynthesis.cancel();
			setIsLoading(false);
			setIsSpeaking(false);
			setIsPaused(false);
			sentenceIndexRef.current = 0;
			sentencesRef.current = [];
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

	const speakSentence = useCallback(
		(index: number, targetRate: number, langCode: string) => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
				return;
			}

			const sentences = sentencesRef.current;
			if (index < 0 || index >= sentences.length) {
				setIsLoading(false);
				setIsSpeaking(false);
				setIsPaused(false);
				sentenceIndexRef.current = 0;
				return;
			}

			sentenceIndexRef.current = index;
			activeRateRef.current = targetRate;

			const sentenceText = sentences[index];
			const utterance = new SpeechSynthesisUtterance(sentenceText);

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
			utterance.rate = targetRate;
			utterance.pitch = 1.0;

			utterance.onstart = () => {
				setIsLoading(false);
				setIsSpeaking(true);
				setIsPaused(false);
			};

			utterance.onend = () => {
				if (isManualCancelRef.current) {
					return;
				}
				const nextIndex = index + 1;
				if (nextIndex < sentencesRef.current.length) {
					speakSentence(nextIndex, activeRateRef.current, langCode);
				} else {
					setIsLoading(false);
					setIsSpeaking(false);
					setIsPaused(false);
					sentenceIndexRef.current = 0;
				}
			};

			utterance.onerror = () => {
				if (isManualCancelRef.current) {
					return;
				}
				setIsLoading(false);
				setIsSpeaking(false);
				setIsPaused(false);
				sentenceIndexRef.current = 0;
			};

			window.speechSynthesis.speak(utterance);
		},
		[]
	);

	const speak = useCallback(
		(text: string, langCode: string = 'pl') => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
				return;
			}

			isManualCancelRef.current = true;
			window.speechSynthesis.cancel();
			isManualCancelRef.current = false;

			setIsLoading(true);

			const sentences = splitIntoSentences(text);
			sentencesRef.current = sentences;
			langCodeRef.current = langCode;

			speakSentence(0, rate, langCode);
		},
		[rate, speakSentence]
	);

	const setRate = useCallback(
		(newRate: number) => {
			setRateState(newRate);
			activeRateRef.current = newRate;
			if (typeof window !== 'undefined') {
				localStorage.setItem('yt_analyzer_tts_rate', newRate.toString());
			}

			if (
				typeof window !== 'undefined' &&
				'speechSynthesis' in window &&
				(window.speechSynthesis.speaking || isSpeaking) &&
				sentencesRef.current.length > 0
			) {
				const currentlyPaused = window.speechSynthesis.paused || isPaused;
				const currentSentenceIndex = sentenceIndexRef.current;
				const currentLang = langCodeRef.current;

				isManualCancelRef.current = true;
				window.speechSynthesis.cancel();
				isManualCancelRef.current = false;

				speakSentence(currentSentenceIndex, newRate, currentLang);
				if (currentlyPaused) {
					window.speechSynthesis.pause();
					setIsPaused(true);
				}
			}
		},
		[isSpeaking, isPaused, speakSentence]
	);

	const toggle = useCallback(
		(text: string, langCode: string = 'pl') => {
			if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
				return;
			}

			if (window.speechSynthesis.speaking || isSpeaking) {
				if (window.speechSynthesis.paused || isPaused) {
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
		[isSpeaking, isPaused, speak]
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
