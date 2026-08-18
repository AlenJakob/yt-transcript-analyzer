import { useState, useCallback, useRef, useEffect, MouseEvent } from 'react';
import { useAiSummary } from '@/hooks/useAiSummary';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCopyClipboard } from '@/hooks/useCopyClipboad';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { exportToTxt, exportToMarkdown, exportToPdf } from '@/lib/exportUtils';
import { Language } from '@/components/LanguageSelect';

interface UseTranscriptGeneratorParams {
	selectedModel: string;
	formattedParagraphs: string[];
}

export function useTranscriptGenerator({
	selectedModel,
	formattedParagraphs,
}: UseTranscriptGeneratorParams) {
	const [selectedLanguage, setSelectedLanguage] = useState<Language>('pl');
	const { aiResponse, isAiLoading, error, generateSummary, abort } = useAiSummary();
	const { isAdmin } = useAuthUser();
	const [copied, setCopied] = useState(false);
	const { copyClipBoard } = useCopyClipboard();
	const {
		isSpeaking,
		isPaused,
		toggle: toggleSpeech,
		stop: stopSpeaking,
		isSupported: isTtsSupported,
	} = useTextToSpeech();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
	const isExportOpen = Boolean(exportAnchorEl);

	const handleToggleSpeak = useCallback(() => {
		if (!isAdmin) return;
		if (aiResponse) {
			toggleSpeech(aiResponse, selectedLanguage);
		}
	}, [isAdmin, toggleSpeech, aiResponse, selectedLanguage]);

	const handleExportClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		setExportAnchorEl(event.currentTarget);
	}, []);

	const handleExportClose = useCallback(() => {
		setExportAnchorEl(null);
	}, []);

	const handleExportTxt = useCallback(() => {
		setExportAnchorEl(null);
		exportToTxt(aiResponse, 'podsumowanie-ai.txt');
	}, [aiResponse]);

	const handleExportMd = useCallback(() => {
		setExportAnchorEl(null);
		exportToMarkdown(aiResponse, 'podsumowanie-ai.md', {
			model: selectedModel,
			language: selectedLanguage,
		});
	}, [aiResponse, selectedModel, selectedLanguage]);

	const handleExportPdf = useCallback(() => {
		setExportAnchorEl(null);
		exportToPdf(aiResponse, {
			model: selectedModel,
			language: selectedLanguage,
		});
	}, [aiResponse, selectedModel, selectedLanguage]);

	const handleGenerateAiSummary = useCallback(() => {
		const transcriptText = formattedParagraphs.join('\n\n');
		setCopied(false);
		stopSpeaking();
		generateSummary(transcriptText, selectedModel, undefined, selectedLanguage);
	}, [formattedParagraphs, selectedModel, selectedLanguage, generateSummary, stopSpeaking]);

	const handleCopy = useCallback(() => {
		if (aiResponse) {
			copyClipBoard(aiResponse);
			setCopied(true);

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				setCopied(false);
				timeoutRef.current = null;
			}, 2000);
		}
	}, [aiResponse, copyClipBoard]);

	return {
		ai: {
			response: aiResponse,
			isLoading: isAiLoading,
			error,
			generate: handleGenerateAiSummary,
			abort,
		},
		clipboard: {
			copied,
			copy: handleCopy,
		},
		speech: {
			isSpeaking,
			isPaused,
			toggle: handleToggleSpeak,
			stop: stopSpeaking,
			isSupported: isTtsSupported,
		},
		export: {
			anchorEl: exportAnchorEl,
			isOpen: isExportOpen,
			open: handleExportClick,
			close: handleExportClose,
			txt: handleExportTxt,
			markdown: handleExportMd,
			pdf: handleExportPdf,
		},
		language: {
			selected: selectedLanguage,
			set: setSelectedLanguage,
		},
		isAdmin,
	};
}
