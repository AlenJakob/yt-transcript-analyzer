export interface ModelOpenRouter {
	architecture: Architecture;
	canonical_slug: string;
	context_length: number;
	created: number;
	default_parameters: DefaultParameters;
	description: string;
	expiration_date: string | null;
	hugging_face_id: string | null;
	id: string;
	knowledge_cutoff: string | null;
	links: Links;
	name: string;
	per_request_limits: PerRequestLimits | null;
	pricing: Pricing;
	reasoning: Reasoning;
	supported_parameters: string[];
	supported_voices: string[] | null;
	top_provider: TopProvider;
}

interface Architecture {
	modality: string;
	input_modalities: string[];
	output_modalities: string[];
	tokenizer: string;
	instruct_type: string | null;
}

interface DefaultParameters {
	temperature: number | null;
	top_p: number | null;
	top_k: number | null;
	frequency_penalty: number | null;
	presence_penalty: number | null;
	repetition_penalty?: number | null;
	max_tokens?: number | null;
	stop?: string[] | null;
	seed?: number | null;
	reasoning?: boolean | null;
	include_reasoning?: boolean | null;
	logprobs?: boolean | null;
	top_logprobs?: number | null;
	tool_choice?: string | null;
	tools?: unknown[] | null;
	[key: string]: unknown;
}

interface Links {
	details: string;
}

interface Pricing {
	prompt: string;
	completion: string;
}

interface Reasoning {
	mandatory: boolean;
	default_enabled: boolean;
}

interface TopProvider {
	context_length: number;
	max_completion_tokens: number;
	is_moderated: boolean;
}

interface PerRequestLimits {
	[key: string]: unknown;
}
