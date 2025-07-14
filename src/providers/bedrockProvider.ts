import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { LLMProvider } from './base';

/**
 * AWS Bedrock Provider for Claude and Titan models
 */
export class BedrockProvider implements LLMProvider {
    private client: BedrockRuntimeClient;
    private region: string;
    private modelId: string;

    constructor(region: string = 'us-east-1', modelId: string = 'anthropic.claude-3-sonnet-20240229-v1:0') {
        this.region = region;
        this.modelId = modelId;
        this.client = new BedrockRuntimeClient({ region: this.region });
    }

    getName(): string {
        return 'AWS Bedrock';
    }

    async sendMessage(message: string, context?: any): Promise<string> {
        try {
            const messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message
                        }
                    ]
                }
            ];

            const payload = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": messages,
                "temperature": 0.5
            };

            const command = new InvokeModelCommand({
                body: JSON.stringify(payload),
                contentType: "application/json",
                accept: "application/json",
                modelId: this.modelId,
            });

            const response = await this.client.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));

            if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content.length > 0) {
                return responseBody.content[0].text;
            }

            return 'No response generated from Bedrock';

        } catch (error: any) {
            console.error('Bedrock error:', error);
            
            if (error.name === 'UnauthorizedOperation' || error.message?.includes('credentials')) {
                throw new Error(`AWS Bedrock authentication failed. Please ensure your AWS credentials are properly configured and you have access to Bedrock in ${this.region}.`);
            } else if (error.name === 'AccessDeniedException') {
                throw new Error(`Access denied to AWS Bedrock. Please ensure you have proper permissions for Bedrock in ${this.region} and the model ${this.modelId} is enabled.`);
            } else {
                throw new Error(`AWS Bedrock error: ${error.message}`);
            }
        }
    }

    /**
     * Test Bedrock access with a simple query
     */
    async testAccess(): Promise<boolean> {
        try {
            await this.sendMessage('Hello, this is a test message.');
            return true;
        } catch (error) {
            console.error('Bedrock test access failed:', error);
            return false;
        }
    }
}
