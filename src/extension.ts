import * as vscode from 'vscode';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Configuration for the Bedrock model
const AWS_REGION = 'us-east-1'; // IMPORTANT: Change this to your desired AWS region where Bedrock is enabled
const BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'; // Or 'anthropic.claude-3-haiku-20240307-v1:0'

// Add debounce utility
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Inline completion provider class for Copilot-like suggestions
class BedrockInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private client: BedrockRuntimeClient;

    constructor() {
        this.client = new BedrockRuntimeClient({ region: AWS_REGION });
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[]> {
        
        // Check if inline completions are enabled
        const config = vscode.workspace.getConfiguration('intellipy');
        if (!config.get('enableInlineCompletions', true)) {
            return [];
        }

        // Get context around cursor
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const precedingLines = Math.min(position.line, 10); // Get up to 10 lines before
        const contextLines: string[] = [];
        
        for (let i = Math.max(0, position.line - precedingLines); i < position.line; i++) {
            contextLines.push(document.lineAt(i).text);
        }
        contextLines.push(linePrefix);
        
        const contextText = contextLines.join('\n');
        
        // Skip if line is too short or ends with certain characters
        if (linePrefix.trim().length < 3 || linePrefix.endsWith(' ') || linePrefix.endsWith('\t')) {
            return [];
        }

        try {
            const completion = await this.getCompletion(contextText, document.languageId);
            if (completion && completion.trim()) {
                return [
                    new vscode.InlineCompletionItem(
                        completion,
                        new vscode.Range(position, position)
                    )
                ];
            }
        } catch (error) {
            console.error('Bedrock inline completion error:', error);
        }

        return [];
    }

    private async getCompletion(context: string, languageId: string): Promise<string> {
        const messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": `You are a ${languageId} code completion assistant. Given the following code context, provide a short, relevant completion for the current line. Only return the completion text, no explanations or markdown formatting.

Context:
\`\`\`${languageId}
${context}
\`\`\`

Complete the last line with appropriate ${languageId} code. Keep it concise and contextually relevant.`
                    }
                ]
            }
        ];

        const payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 150, // Shorter for inline completions
            "messages": messages,
            "temperature": 0.3 // Lower temperature for more deterministic completions
        };

        const command = new InvokeModelCommand({
            body: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
            modelId: BEDROCK_MODEL_ID,
        });

        const response = await this.client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content.length > 0) {
            return responseBody.content[0].text.trim();
        }

        return '';
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('IntelliPy AI Code Assistant is now active!');

    // Register inline completion provider
    const inlineProvider = new BedrockInlineCompletionProvider();
    const inlineDisposable = vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file' }, // All file schemes
        inlineProvider
    );

    // Original generate code command
    let disposable = vscode.commands.registerCommand('intellipy.generateCode', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showInformationMessage('No active text editor found.');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showInformationMessage('Please select some text to generate code from.');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating code with Bedrock...",
            cancellable: false
        }, async (progress) => {
            try {
                // Initialize Bedrock client
                const client = new BedrockRuntimeClient({ region: AWS_REGION });

                // Construct prompt for Claude 3 models
                // Claude 3 uses the Messages API format
                const messages = [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": `Refactor, explain, or generate code based on the following selection. If generating, provide only the code. If refactoring or explaining, provide a clear explanation. If no specific instruction is given, refactor or explain.

Selected Text:
\`\`\`
${selectedText}
\`\`\`
`
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
                    modelId: BEDROCK_MODEL_ID,
                });

                const response = await client.send(command);
                const responseBody = JSON.parse(new TextDecoder().decode(response.body));

                let generatedContent = "No response content found.";
                if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content.length > 0) {
                    generatedContent = responseBody.content[0].text;
                }

                // Insert the generated content into the editor below the selection
                await editor.edit(editBuilder => {
                    // Move cursor to end of selection and insert new line
                    const insertPosition = selection.end;
                    editBuilder.insert(insertPosition, `\n\n/* Bedrock Generated Content */\n${generatedContent}\n/* End Bedrock Generated Content */\n`);
                });

                vscode.window.showInformationMessage('Code generation complete!');

            } catch (error: any) {
                console.error("Error invoking Bedrock:", error);
                // Check for common Bedrock errors
                if (error.name === 'ValidationException' && error.message.includes('modelId')) {
                    vscode.window.showErrorMessage(`Bedrock Error: Invalid Model ID or Model Access not enabled for '${BEDROCK_MODEL_ID}'. Please check your AWS Bedrock console.`);
                } else if (error.name === 'AccessDeniedException') {
                     vscode.window.showErrorMessage('Bedrock Error: Access Denied. Please ensure your AWS credentials have permissions for Bedrock Runtime (bedrock:InvokeModel).');
                }
                else {
                    vscode.window.showErrorMessage(`Failed to generate code with Bedrock: ${error.message}`);
                }
            }
        });
    });

    // Add chat command for Copilot-like chat interface
    let chatDisposable = vscode.commands.registerCommand('intellipy.openChat', async () => {
        const panel = vscode.window.createWebviewPanel(
            'intellipyChat',
            'IntelliPy Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: []
            }
        );

        panel.webview.html = getChatWebviewContent();
        
        // Handle messages from webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'sendMessage') {
                const response = await getChatResponse(message.text);
                panel.webview.postMessage({
                    command: 'receiveMessage',
                    text: response
                });
            }
        });
    });

    // Toggle inline completions command
    let toggleDisposable = vscode.commands.registerCommand('intellipy.toggleInlineCompletions', async () => {
        const config = vscode.workspace.getConfiguration('intellipy');
        const currentValue = config.get('enableInlineCompletions', true);
        await config.update('enableInlineCompletions', !currentValue, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`IntelliPy inline completions ${!currentValue ? 'enabled' : 'disabled'}`);
    });

    context.subscriptions.push(disposable, inlineDisposable, chatDisposable, toggleDisposable);
}

async function getChatResponse(userMessage: string): Promise<string> {
    try {
        const client = new BedrockRuntimeClient({ region: AWS_REGION });
        
        const messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": userMessage
                    }
                ]
            }
        ];

        const payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": messages,
            "temperature": 0.7
        };

        const command = new InvokeModelCommand({
            body: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
            modelId: BEDROCK_MODEL_ID,
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content.length > 0) {
            return responseBody.content[0].text;
        }

        return "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Chat error:', error);
        return "An error occurred while processing your request.";
    }
}

function getChatWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bedrock Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 20px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        }
        
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
        }
        
        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20%;
        }
        
        .assistant-message {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            margin-right: 20%;
        }
        
        .input-container {
            display: flex;
            gap: 10px;
        }
        
        #messageInput {
            flex: 1;
            padding: 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        
        #sendButton {
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        #sendButton:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="chat-container" id="chatContainer">
        <div class="message assistant-message">
            <strong>IntelliPy Assistant:</strong> Hello! I'm your AI coding assistant powered by AWS Bedrock. I can help you with:
            <br>• Code explanations and improvements
            <br>• Debugging assistance  
            <br>• Writing new functions
            <br>• Best practices and optimizations
            <br><br>What can I help you with today?
        </div>
    </div>
    
    <div class="input-container">
        <input type="text" id="messageInput" placeholder="Ask me anything about code..." />
        <button id="sendButton">Send</button>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
            messageDiv.innerHTML = \`<strong>\${isUser ? 'You' : 'IntelliPy Assistant'}:</strong> \${text}\`;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            addMessage(text, true);
            messageInput.value = '';
            
            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });
        }
        
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'receiveMessage') {
                addMessage(message.text);
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}