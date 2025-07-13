import * as vscode from 'vscode';
import { ChatMode, ChatSession, ChatMessage, FileEdit } from './types';
import { LLMService } from './llmService';
import { CodeAnalyzer } from './codeAnalyzer';

export class ChatModeManager {
    private currentMode: ChatMode = ChatMode.Ask;
    private sessions: Map<string, ChatSession> = new Map();
    private activeSessionId: string | null = null;

    constructor(
        private llmService: LLMService,
        private codeAnalyzer: CodeAnalyzer
    ) {}

    setMode(mode: ChatMode) {
        this.currentMode = mode;
        if (this.activeSessionId) {
            const session = this.sessions.get(this.activeSessionId);
            if (session) {
                session.mode = mode;
            }
        }
    }

    getMode(): ChatMode {
        return this.currentMode;
    }

    async processMessage(message: string, context: any): Promise<ChatMessage> {
        switch (this.currentMode) {
            case ChatMode.Ask:
                return this.processAskMode(message, context);
            case ChatMode.Edit:
                return this.processEditMode(message, context);
            case ChatMode.Agent:
                return this.processAgentMode(message, context);
            default:
                return this.processAskMode(message, context);
        }
    }

    private async processAskMode(message: string, context: any): Promise<ChatMessage> {
        // Standard Q&A mode - current implementation
        const contextStr = await this.buildContextString(context);
        const response = await this.llmService.sendPrompt(message, contextStr);
        
        return {
            role: 'assistant',
            content: response,
            mode: ChatMode.Ask,
            metadata: {
                files: context.files?.map((f: any) => f.uri.fsPath)
            }
        };
    }

    private async processEditMode(message: string, context: any): Promise<ChatMessage> {
        // Edit mode - direct code modifications
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return {
                role: 'assistant',
                content: 'No active editor found. Please open a file to edit.',
                mode: ChatMode.Edit
            };
        }

        const document = activeEditor.document;
        const selection = activeEditor.selection;
        const selectedText = document.getText(selection.isEmpty ? undefined : selection);
        
        // Build context with current file and selection
        const contextStr = `File: ${document.fileName}\n` +
            `Language: ${document.languageId}\n` +
            `Selected Text:\n${selectedText || document.getText()}\n`;

        // Request edit from LLM
        const editPrompt = `${message}\n\nProvide the edited code. Return ONLY the modified code without explanations.`;
        const response = await this.llmService.sendPrompt(editPrompt, contextStr);

        // Create file edit
        const fileEdit: FileEdit = {
            uri: document.uri,
            originalContent: selectedText || document.getText(),
            newContent: response,
            applied: false
        };

        return {
            role: 'assistant',
            content: `Here's the suggested edit:\n\`\`\`${document.languageId}\n${response}\n\`\`\``,
            mode: ChatMode.Edit,
            metadata: {
                edits: [fileEdit]
            }
        };
    }

    private async processAgentMode(message: string, context: any): Promise<ChatMessage> {
        // Agent mode - autonomous multi-step tasks
        const steps: string[] = [];
        let currentContext = context;
        
        // Create a plan
        const planPrompt = `Create a step-by-step plan to: ${message}\n` +
            `Format: List each step on a new line starting with a number.`;
        const planResponse = await this.llmService.sendPrompt(planPrompt, await this.buildContextString(currentContext));
        
        steps.push(`📋 Plan:\n${planResponse}\n`);

        // Execute steps (simplified for now)
        const executePrompt = `Execute this task: ${message}\n` +
            `Provide code changes, commands, or actions needed.`;
        const executionResponse = await this.llmService.sendPrompt(executePrompt, await this.buildContextString(currentContext));

        steps.push(`🚀 Execution:\n${executionResponse}`);

        return {
            role: 'assistant',
            content: steps.join('\n\n'),
            mode: ChatMode.Agent,
            metadata: {
                workspace: true
            }
        };
    }

    private async buildContextString(context: any): Promise<string> {
        const parts: string[] = [];
        
        if (context.files && context.files.length > 0) {
            const consolidatedCode = await this.codeAnalyzer.consolidateCode(context.files);
            parts.push(consolidatedCode);
        }

        if (context.selectedText) {
            parts.push(`Selected Text:\n${context.selectedText}`);
        }

        return parts.join('\n\n');
    }

    createSession(): string {
        const sessionId = Date.now().toString();
        const session: ChatSession = {
            id: sessionId,
            mode: this.currentMode,
            messages: [],
            context: {
                referencedFiles: new Set(),
                referencedSymbols: new Set()
            }
        };
        this.sessions.set(sessionId, session);
        this.activeSessionId = sessionId;
        return sessionId;
    }

    getActiveSession(): ChatSession | null {
        return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null;
    }
}