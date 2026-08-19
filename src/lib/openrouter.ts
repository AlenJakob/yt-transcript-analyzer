import OpenAI from 'openai';

/**
 * Returns the normalized OpenRouter base URL without a trailing slash.
 */
export function getOpenRouterBaseUrl(): string {
	const rawUrl = process.env.NEXT_PUBLIC_OPENROUTER_API || 'https://openrouter.ai/api/v1';
	return rawUrl.replace(/\/+$/, '');
}

/**
 * Returns the OpenRouter API Key from environment variables.
 */
export function getOpenRouterApiKey(): string {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('OPENROUTER_API_KEY environment variable is not configured.');
	}
	return apiKey;
}

/**
 * Lazily creates and returns an OpenAI client instance configured for OpenRouter.
 */
export function getOpenAIClient(): OpenAI {
	const apiKey = getOpenRouterApiKey();
	const baseURL = getOpenRouterBaseUrl();

	return new OpenAI({
		apiKey,
		baseURL,
		defaultHeaders: {
			'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			'X-Title': 'YT Transcript Analyzer',
		},
	});
}
