import fetch from 'node-fetch';
import { LLMProvider } from './base';

/**
 * Custom Server Provider for any REST API endpoint
 */
export class CustomProvider implements LLMProvider {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    getName(): string {
        return 'Custom Server';
    }

    async sendMessage(message: string, context?: any): Promise<string> {
        if (!this.endpoint) {
            throw new Error('Custom endpoint not configured. Please set intellipy.customEndpoint in settings.');
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`Custom provider API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as any;
            return data.response || data.message || data.text || 'No response from custom provider';
            
        } catch (error: any) {
            console.error('Custom provider error:', error);
            throw new Error(`Custom provider failed: ${error.message}`);
        }
    }

    /**
     * Validate the endpoint URL
     */
    static isValidEndpoint(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
