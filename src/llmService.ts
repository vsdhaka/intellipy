import * as vscode from 'vscode';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export interface LLMProvider {
    sendPrompt(prompt: string, context: string): Promise<string>;
}

// Helper function to make HTTP requests (since fetch isn't available in VS Code extensions)
function makeHttpRequest(url: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = protocol.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve({
                            ok: true,
                            status: res.statusCode,
                            json: () => Promise.resolve(JSON.parse(data))
                        });
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${e}`));
                    }
                } else {
                    resolve({
                        ok: false,
                        status: res.statusCode,
                        statusText: res.statusMessage
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

export class LLMService {
    private provider: LLMProvider | null = null;

    constructor() {
        this.initializeProvider();
    }

    private initializeProvider() {
        const config = vscode.workspace.getConfiguration('intellipy');
        const providerType = config.get<string>('llmProvider', 'bedrock');

        switch (providerType) {
            case 'bedrock':
                this.provider = new BedrockProvider();
                break;
            case 'gemini':
                this.provider = new GeminiProvider();
                break;
            case 'custom':
                this.provider = new CustomServerProvider();
                break;
            default:
                throw new Error(`Unknown provider: ${providerType}`);
        }
    }

    async sendPrompt(prompt: string, context: string): Promise<string> {
        if (!this.provider) {
            throw new Error('LLM provider not initialized');
        }

        return this.provider.sendPrompt(prompt, context);
    }
}

class BedrockProvider implements LLMProvider {
    private client: BedrockRuntimeClient;

    constructor() {
        const config = vscode.workspace.getConfiguration('intellipy');
        const region = config.get<string>('awsRegion', 'us-east-1');
        
        // Initialize Bedrock client
        this.client = new BedrockRuntimeClient({ 
            region,
            // AWS credentials are automatically loaded from:
            // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
            // 2. AWS credentials file (~/.aws/credentials)
            // 3. AWS SSO
            // 4. IAM roles (if running on EC2/Lambda)
        });
    }

    async sendPrompt(prompt: string, context: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('intellipy');
        const modelId = config.get<string>('modelId', 'anthropic.claude-3-5-sonnet-20241022-v2:0');

        try {
            const fullPrompt = `${prompt}\n\nContext:\n${context}`;
            
            // Prepare the request body based on the model
            let requestBody: any;
            
            if (modelId.startsWith('anthropic.claude-3')) {
                // Claude 3+ models (including 3.5 Sonnet, 3 Opus, etc.) use the Messages API
                requestBody = {
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 4096,
                    temperature: 0.7,
                    messages: [
                        {
                            role: "user",
                            content: fullPrompt
                        }
                    ],
                    system: "You are a helpful AI assistant specialized in Python development. Analyze the code and provide helpful suggestions."
                };
            } else if (modelId.includes('anthropic.claude-v2') || modelId.includes('anthropic.claude-instant')) {
                // Older Claude v2 models use the completion format
                requestBody = {
                    prompt: `\n\nHuman: ${fullPrompt}\n\nAssistant:`,
                    max_tokens_to_sample: 4096,
                    temperature: 0.7,
                    top_p: 0.9,
                    stop_sequences: ["\n\nHuman:"]
                };
            } else if (modelId.startsWith('amazon.titan')) {
                // Titan models use this format
                requestBody = {
                    inputText: fullPrompt,
                    textGenerationConfig: {
                        maxTokenCount: 4096,
                        temperature: 0.7,
                        topP: 0.9,
                        stopSequences: []
                    }
                };
            } else {
                throw new Error(`Unsupported model: ${modelId}`);
            }

            // Invoke the model
            const command = new InvokeModelCommand({
                modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify(requestBody)
            });

            const response = await this.client.send(command);
            
            // Parse the response
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            
            // Extract the generated text based on the model
            if (modelId.startsWith('anthropic.claude-3')) {
                // Claude 3+ models return content in a different format
                return responseBody.content[0].text;
            } else if (modelId.includes('anthropic.claude')) {
                // Older Claude models
                return responseBody.completion;
            } else if (modelId.startsWith('amazon.titan')) {
                return responseBody.results[0].outputText;
            }
            
            return 'Unexpected response format';
        } catch (error: any) {
            // Handle specific AWS errors
            if (error.name === 'AccessDeniedException') {
                throw new Error('AWS access denied. Please check your credentials and permissions.');
            } else if (error.name === 'ModelNotReadyException') {
                throw new Error('Model is not ready. Please try again later.');
            } else if (error.name === 'ValidationException') {
                throw new Error(`Invalid request: ${error.message}`);
            } else if (error.name === 'ThrottlingException') {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            
            throw new Error(`Bedrock error: ${error.message || error}`);
        }
    }
}

class GeminiProvider implements LLMProvider {
    async sendPrompt(prompt: string, context: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('intellipy');
        const apiKey = config.get<string>('geminiApiKey', '');
        const model = config.get<string>('geminiModel', 'gemini-pro');
        
        if (!apiKey) {
            throw new Error('Gemini API key not configured. Set intellipy.geminiApiKey in settings.');
        }

        try {
            const response = await makeHttpRequest(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${prompt}\n\nContext:\n${context}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 4096,
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error: any) {
            throw new Error(`Gemini error: ${error.message || error}`);
        }
    }
}

class CustomServerProvider implements LLMProvider {
    async sendPrompt(prompt: string, context: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('intellipy');
        const endpoint = config.get<string>('customEndpoint', '');
        const apiKey = config.get<string>('customApiKey', '');
        const model = config.get<string>('customModel', '');
        const format = config.get<string>('customFormat', 'openai');
        
        if (!endpoint) {
            throw new Error('Custom endpoint not configured. Set intellipy.customEndpoint in settings.');
        }

        const fullPrompt = `${prompt}\n\nContext:\n${context}`;
        
        try {
            let requestBody: any;
            let headers: any = { 'Content-Type': 'application/json' };
            
            // Add API key if provided
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            
            // Format request based on server type
            if (format === 'openai') {
                // OpenAI-compatible format (works with Ollama, llama.cpp server, etc.)
                requestBody = {
                    model: model || 'default',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant specialized in Python development.'
                        },
                        {
                            role: 'user',
                            content: fullPrompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                };
            } else if (format === 'ollama') {
                // Native Ollama format
                requestBody = {
                    model: model || 'codellama',
                    prompt: fullPrompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 4096
                    }
                };
            } else {
                // Raw format - just send the prompt
                requestBody = { prompt: fullPrompt };
            }
            
            const response = await makeHttpRequest(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Extract response based on format
            if (format === 'openai') {
                return data.choices[0].message.content;
            } else if (format === 'ollama') {
                return data.response;
            } else {
                // Try common response fields
                return data.response || data.content || data.text || JSON.stringify(data);
            }
        } catch (error: any) {
            throw new Error(`Custom server error: ${error.message || error}`);
        }
    }
}