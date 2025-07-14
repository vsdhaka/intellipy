/**
 * Base interface for all LLM providers
 */
export interface LLMProvider {
    getName(): string;
    sendMessage(message: string, context?: any): Promise<string>;
}

/**
 * Provider types supported by IntelliPy
 */
export type ProviderType = 'bedrock' | 'm365copilot' | 'custom';
