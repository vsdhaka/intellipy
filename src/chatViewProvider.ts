import * as vscode from 'vscode';
import { LLMService } from './llmService';
import { CodeAnalyzer, FileContext } from './codeAnalyzer';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'intellipyChat';
    private _view?: vscode.WebviewView;
    private messages: Array<{role: string, content: string}> = [];
    private lastAnalyzedFiles: FileContext[] = [];
    private pendingChanges: Map<string, string> | null = null;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly llmService: LLMService,
        private readonly codeAnalyzer: CodeAnalyzer
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleUserMessage(data.value);
                    break;
                case 'analyzeCurrentFile':
                    await this.analyzeCurrentFile();
                    break;
                case 'applyChanges':
                    if (this.pendingChanges) {
                        await vscode.commands.executeCommand('intellipy.applyChanges', this.pendingChanges);
                    }
                    break;
                case 'showDiff':
                    if (data.filePath && data.content) {
                        await vscode.commands.executeCommand('intellipy.showDiff', data.filePath, data.content);
                    }
                    break;
            }
        });
    }

    public addMessage(role: string, content: string) {
        this.messages.push({ role, content });
        if (this._view) {
            this._view.webview.postMessage({ 
                type: 'addMessage', 
                message: { role, content } 
            });
        }
    }

    private addMessageWithActions(role: string, content: string, fileUpdates: Map<string, string>) {
        this.messages.push({ role, content });
        if (this._view) {
            const files = Array.from(fileUpdates.keys()).map(path => ({
                path,
                name: path.split('/').pop() || path
            }));
            
            this._view.webview.postMessage({ 
                type: 'addMessageWithActions', 
                message: { role, content },
                files
            });
        }
    }

    private async handleUserMessage(message: string) {
        this.addMessage('user', message);

        try {
            // Get context from current file if needed
            const editor = vscode.window.activeTextEditor;
            let context = '';
            
            if (editor && editor.document.languageId === 'python') {
                const relevantFiles = await this.codeAnalyzer.getRelevantFiles(editor.document.uri);
                context = await this.codeAnalyzer.consolidateCode(relevantFiles);
            }

            const response = await this.llmService.sendPrompt(message, context);
            
            // Check if response contains code changes
            if (context && this.lastAnalyzedFiles.length > 0) {
                const fileUpdates = this.codeAnalyzer.parseResponse(response, this.lastAnalyzedFiles);
                if (fileUpdates.size > 0) {
                    this.pendingChanges = fileUpdates;
                    this.addMessageWithActions('assistant', response, fileUpdates);
                    return;
                }
            }
            
            this.addMessage('assistant', response);
        } catch (error) {
            this.addMessage('assistant', `Error: ${error}`);
        }
    }

    private async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            this.addMessage('assistant', 'Please open a Python file to analyze.');
            return;
        }

        try {
            const relevantFiles = await this.codeAnalyzer.getRelevantFiles(editor.document.uri);
            this.lastAnalyzedFiles = relevantFiles;
            const context = await this.codeAnalyzer.consolidateCode(relevantFiles);
            
            const response = await this.llmService.sendPrompt(
                'Analyze this Python code and provide suggestions for improvements. If you suggest code changes, format them with the file path using ### File: path/to/file.py followed by the code in markdown blocks.',
                context
            );
            
            // Parse response for file updates
            const fileUpdates = this.codeAnalyzer.parseResponse(response, relevantFiles);
            if (fileUpdates.size > 0) {
                this.pendingChanges = fileUpdates;
                this.addMessageWithActions('assistant', response, fileUpdates);
            } else {
                this.addMessage('assistant', response);
            }
        } catch (error) {
            this.addMessage('assistant', `Error analyzing file: ${error}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
        const prismCss = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        const prismJs = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        const prismPython = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js';

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <link rel="stylesheet" href="${prismCss}">
                <script src="${prismJs}"></script>
                <script src="${prismPython}"></script>
                <title>IntelliPy</title>
            </head>
            <body>
                <div class="chat-container">
                    <div class="toolbar">
                        <button id="analyze-btn">Analyze Current File</button>
                        <div id="context-files" class="context-files"></div>
                    </div>
                    <div id="messages" class="messages"></div>
                    <div class="input-container">
                        <textarea id="message-input" placeholder="Ask a question about your code..."></textarea>
                        <button id="send-btn">Send</button>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const messagesDiv = document.getElementById('messages');
                    const messageInput = document.getElementById('message-input');
                    const sendBtn = document.getElementById('send-btn');
                    const analyzeBtn = document.getElementById('analyze-btn');
                    const contextFilesDiv = document.getElementById('context-files');

                    sendBtn.addEventListener('click', sendMessage);
                    analyzeBtn.addEventListener('click', () => {
                        vscode.postMessage({ type: 'analyzeCurrentFile' });
                    });
                    
                    messageInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    });

                    function sendMessage() {
                        const message = messageInput.value.trim();
                        if (message) {
                            vscode.postMessage({ type: 'sendMessage', value: message });
                            messageInput.value = '';
                        }
                    }

                    window.addEventListener('message', event => {
                        const data = event.data;
                        if (data.type === 'addMessage') {
                            addMessageToChat(data.message);
                        } else if (data.type === 'addMessageWithActions') {
                            addMessageWithActions(data.message, data.files);
                        }
                    });

                    function formatContent(content) {
                        // Convert markdown code blocks to highlighted code
                        return content.replace(/\`\`\`(python)?\n([\s\S]*?)\`\`\`/g, (match, lang, code) => {
                            const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            return '<pre><code class="language-python">' + escaped + '</code></pre>';
                        }).replace(/### File: (.*?)\\n/g, '<div class="file-header">📄 $1</div>');
                    }

                    function addMessageToChat(message) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'message ' + message.role;
                        messageDiv.innerHTML = formatContent(message.content);
                        messagesDiv.appendChild(messageDiv);
                        
                        // Apply syntax highlighting
                        messageDiv.querySelectorAll('pre code').forEach(block => {
                            Prism.highlightElement(block);
                        });
                        
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }

                    function addMessageWithActions(message, files) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'message ' + message.role;
                        messageDiv.innerHTML = formatContent(message.content);
                        
                        // Add action buttons
                        if (files && files.length > 0) {
                            const actionsDiv = document.createElement('div');
                            actionsDiv.className = 'message-actions';
                            
                            const applyBtn = document.createElement('button');
                            applyBtn.className = 'action-btn apply';
                            applyBtn.textContent = '✅ Apply All Changes';
                            applyBtn.onclick = () => {
                                vscode.postMessage({ type: 'applyChanges' });
                            };
                            
                            actionsDiv.appendChild(applyBtn);
                            
                            files.forEach(file => {
                                const diffBtn = document.createElement('button');
                                diffBtn.className = 'action-btn diff';
                                diffBtn.textContent = '🔍 Diff: ' + file.name;
                                diffBtn.onclick = () => {
                                    vscode.postMessage({ 
                                        type: 'showDiff', 
                                        filePath: file.path,
                                        content: extractFileContent(message.content, file.path)
                                    });
                                };
                                actionsDiv.appendChild(diffBtn);
                            });
                            
                            messageDiv.appendChild(actionsDiv);
                        }
                        
                        messagesDiv.appendChild(messageDiv);
                        
                        // Apply syntax highlighting
                        messageDiv.querySelectorAll('pre code').forEach(block => {
                            Prism.highlightElement(block);
                        });
                        
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }

                    function extractFileContent(response, filePath) {
                        // Simple approach: split by file headers and find the right section
                        const sections = response.split('### File: ');
                        for (const section of sections) {
                            if (section.startsWith(filePath)) {
                                const codeMatch = section.match(/\`\`\`(?:python)?\n([\s\S]*?)\`\`\`/);
                                return codeMatch ? codeMatch[1] : '';
                            }
                        }
                        return '';
                    }
                </script>
            </body>
            </html>`;
    }
}