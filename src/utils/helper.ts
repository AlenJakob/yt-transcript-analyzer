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
