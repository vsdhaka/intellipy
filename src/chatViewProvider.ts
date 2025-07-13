import * as vscode from 'vscode';
import { LLMService } from './llmService';
import { CodeAnalyzer, FileContext } from './codeAnalyzer';
import { ChatModeManager } from './chatModeManager';
import { MentionProvider } from './mentionProvider';
import { ToolSystem } from './toolSystem';
import { ChatMode } from './types';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'intellipyChat';
    private _view?: vscode.WebviewView;
    private messages: Array<{role: string, content: string}> = [];
    private lastAnalyzedFiles: FileContext[] = [];
    private pendingChanges: Map<string, string> | null = null;
    private currentMode: ChatMode = ChatMode.Ask;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly llmService: LLMService,
        private readonly codeAnalyzer: CodeAnalyzer,
        private readonly chatModeManager: ChatModeManager,
        private readonly mentionProvider: MentionProvider,
        private readonly toolSystem: ToolSystem
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
                case 'setMode':
                    this.updateMode(data.mode);
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

    public updateMode(mode: ChatMode) {
        this.currentMode = mode;
        this.chatModeManager.setMode(mode);
        if (this._view) {
            this._view.webview.postMessage({ 
                type: 'modeChanged', 
                mode: mode 
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
            // Resolve mentions in the message
            const { resolvedText, context: mentionContext } = await this.mentionProvider.resolveMentions(message);
            
            // Build context based on mentions and current file
            const editor = vscode.window.activeTextEditor;
            const files = [...mentionContext.files];
            
            // Add current file if not already included
            if (editor && editor.document.languageId === 'python' && !mentionContext.includeWorkspace) {
                const currentUri = editor.document.uri;
                if (!files.some(uri => uri.toString() === currentUri.toString())) {
                    files.push(currentUri);
                }
            }
            
            // If workspace is mentioned, get all relevant files
            if (mentionContext.includeWorkspace && editor) {
                const relevantFiles = await this.codeAnalyzer.getRelevantFiles(editor.document.uri);
                this.lastAnalyzedFiles = relevantFiles;
                relevantFiles.forEach(file => {
                    if (!files.some(uri => uri.toString() === file.uri.toString())) {
                        files.push(file.uri);
                    }
                });
            }
            
            // Build context object for chat mode manager
            const context = {
                files: await Promise.all(files.map(async uri => ({
                    uri,
                    content: (await vscode.workspace.openTextDocument(uri)).getText(),
                    relativePath: vscode.workspace.asRelativePath(uri)
                }))),
                symbols: mentionContext.symbols,
                includeWorkspace: mentionContext.includeWorkspace
            };
            
            // Process message through chat mode manager
            const response = await this.chatModeManager.processMessage(resolvedText || message, context);
            
            // Handle response based on metadata
            if (response.metadata?.edits && response.metadata.edits.length > 0) {
                // Convert edits to file updates for backward compatibility
                const fileUpdates = new Map<string, string>();
                response.metadata.edits.forEach(edit => {
                    fileUpdates.set(edit.uri.fsPath, edit.newContent);
                });
                this.pendingChanges = fileUpdates;
                this.addMessageWithActions('assistant', response.content, fileUpdates);
            } else {
                this.addMessage('assistant', response.content);
            }
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
        const prismCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'prism-tomorrow.css'));
        const prismJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'prism-bundle.js'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
                <link href="${styleUri}" rel="stylesheet">
                <link href="${prismCssUri}" rel="stylesheet">
                <script src="${prismJsUri}"></script>
                <title>IntelliPy - Privacy First Python Assistant</title>
            </head>
            <body>
                <div class="chat-container">
                    <div class="toolbar">
                        <div class="mode-selector">
                            <button class="mode-btn active" data-mode="ask" title="Ask questions about code">Ask</button>
                            <button class="mode-btn" data-mode="edit" title="Edit code directly">Edit</button>
                            <button class="mode-btn" data-mode="agent" title="Autonomous task execution">Agent</button>
                        </div>
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

                    // Mode selection handling
                    const modeButtons = document.querySelectorAll('.mode-btn');
                    let currentMode = 'ask';
                    
                    modeButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            modeButtons.forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            currentMode = btn.dataset.mode;
                            vscode.postMessage({ type: 'setMode', mode: currentMode });
                            updatePlaceholder();
                        });
                    });

                    function updatePlaceholder() {
                        switch(currentMode) {
                            case 'ask':
                                messageInput.placeholder = 'Ask a question about your code...';
                                break;
                            case 'edit':
                                messageInput.placeholder = 'Describe the edit you want to make...';
                                break;
                            case 'agent':
                                messageInput.placeholder = 'Describe the task to complete...';
                                break;
                        }
                    }

                    // Handle mode change from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'modeChanged') {
                            currentMode = message.mode;
                            modeButtons.forEach(btn => {
                                btn.classList.toggle('active', btn.dataset.mode === currentMode);
                            });
                            updatePlaceholder();
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}