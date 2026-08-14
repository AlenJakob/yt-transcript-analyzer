export const useCopyClipboard = () => {
	const copyClipBoard = (content: string) => {
		navigator.clipboard.writeText(content);
	};

	return {
		copyClipBoard,
	};
};
