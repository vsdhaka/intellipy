import * as vscode from 'vscode';
import { LLMProvider, ProviderType } from './base';
import { BedrockProvider } from './bedrockProvider';
import { M365CopilotProvider } from './m365Provider';
import { CustomProvider } from './customProvider';

// Re-export ProviderType for convenience
export { ProviderType } from './base';

/**
 * Factory for creating LLM providers
 */
export class ProviderFactory {
    /**
     * Create a provider instance based on configuration
     */
    static createProvider(type?: ProviderType): LLMProvider {
        const config = vscode.workspace.getConfiguration('intellipy');
        const providerType = type || config.get<ProviderType>('llmProvider', 'bedrock');

        switch (providerType) {
            case 'm365copilot':
                return new M365CopilotProvider();
            
            case 'custom':
                const customEndpoint = config.get<string>('customEndpoint', '');
                return new CustomProvider(customEndpoint);
            
            case 'bedrock':
            default:
                const awsRegion = config.get<string>('awsRegion', 'us-east-1');
                const modelId = config.get<string>('modelId', 'anthropic.claude-3-sonnet-20240229-v1:0');
                return new BedrockProvider(awsRegion, modelId);
        }
    }

    /**
     * Get the current provider response
     */
    static async getResponse(message: string, context?: any): Promise<string> {
        const provider = this.createProvider();
        return await provider.sendMessage(message, context);
    }

    /**
     * Get provider configuration items for selection UI
     */
    static getProviderItems() {
        return [
            {
                label: '$(cloud) AWS Bedrock',
                description: 'Privacy-first AI with Claude and Titan models',
                detail: 'Requires AWS credentials and Bedrock access',
                value: 'bedrock' as ProviderType
            },
            {
                label: '$(microsoft) Microsoft 365 Copilot',
                description: 'Use your M365 Copilot subscription',
                detail: 'Opens browser to M365 Copilot (requires M365 Business license)',
                value: 'm365copilot' as ProviderType
            },
            {
                label: '$(server) Custom Server',
                description: 'Your own AI endpoint',
                detail: 'Requires custom server URL configuration',
                value: 'custom' as ProviderType
            }
        ];
    }
}
