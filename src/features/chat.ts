import * as vscode from 'vscode';
import { ProviderFactory } from '../providers/providerFactory';

/**
 * Chat webview provider for IntelliPy
 */
export class ChatProvider {
    /**
     * Create and show the chat webview
     */
    static async createChatPanel(): Promise<vscode.WebviewPanel> {
        const panel = vscode.window.createWebviewPanel(
            'intellipyChat',
            'IntelliPy Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = this.getChatWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'sendMessage') {
                try {
                    const response = await ProviderFactory.getResponse(message.text);
                    panel.webview.postMessage({
                        command: 'receiveMessage',
                        text: response
                    });
                } catch (error: any) {
                    panel.webview.postMessage({
                        command: 'receiveMessage',
                        text: `Error: ${error.message}`
                    });
                }
            }
        });

        return panel;
    }

    /**
     * Generate the HTML content for the chat webview
     */
    private static getChatWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntelliPy Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            height: 100vh;
            box-sizing: border-box;
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: var(--vscode-editor-background);
        }
        
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 6px;
            line-height: 1.5;
        }
        
        .user-message {
            background-color: var(--vscode-inputOption-activeBorder);
            margin-left: 20px;
            opacity: 0.9;
        }
        
        .bot-message {
            background-color: var(--vscode-editor-selectionBackground);
            margin-right: 20px;
            white-space: pre-wrap;
        }
        
        .input-container {
            display: flex;
            gap: 10px;
        }
        
        .message-input {
            flex: 1;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: inherit;
            font-size: inherit;
            outline: none;
        }
        
        .message-input:focus {
            border-color: var(--vscode-focusBorder);
        }
        
        .send-button {
            padding: 12px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: inherit;
        }
        
        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .send-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .welcome-message {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="chat-container" id="chatContainer">
        <div class="welcome-message">
            👋 Welcome to IntelliPy Chat! Ask me anything about coding, debugging, or general questions.
        </div>
    </div>
    
    <div class="input-container">
        <input 
            type="text" 
            id="messageInput" 
            class="message-input" 
            placeholder="Type your message..." 
            maxlength="2000"
        />
        <button id="sendButton" class="send-button">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'bot-message'}\`;
            messageDiv.textContent = text;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, true);
            messageInput.value = '';
            sendButton.disabled = true;
            sendButton.textContent = 'Sending...';

            vscode.postMessage({
                command: 'sendMessage',
                text: message
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
                addMessage(message.text, false);
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
                messageInput.focus();
            }
        });

        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>`;
    }
}

/**
 * Register chat command
 */
export function registerChatCommand(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.commands.registerCommand('intellipy.openChat', async () => {
        await ChatProvider.createChatPanel();
    });
}
