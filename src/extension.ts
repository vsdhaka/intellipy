import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';
import { LLMService } from './llmService';
import { ChatViewProvider } from './chatViewProvider';
import { ChatModeManager } from './chatModeManager';
import { InlineChatProvider } from './inlineChatProvider';
import { MentionProvider } from './mentionProvider';
import { ToolSystem } from './toolSystem';
import { ChatMode } from './types';

export function activate(context: vscode.ExtensionContext) {
    console.log('IntelliPy is now active!');

    // Initialize core services
    const codeAnalyzer = new CodeAnalyzer();
    const llmService = new LLMService();
    const chatModeManager = new ChatModeManager(llmService, codeAnalyzer);
    const mentionProvider = new MentionProvider();
    const toolSystem = new ToolSystem();
    const inlineChatProvider = new InlineChatProvider(chatModeManager);
    
    // Update chat provider to use new services
    const chatProvider = new ChatViewProvider(
        context.extensionUri, 
        llmService, 
        codeAnalyzer,
        chatModeManager,
        mentionProvider,
        toolSystem
    );

    // Register providers
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('intellipyChat', chatProvider),
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file', pattern: '**/*.py' },
            inlineChatProvider
        )
    );

    let analyzeCommand = vscode.commands.registerCommand('intellipy.analyzeCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing code...",
                cancellable: false
            }, async (progress) => {
                const relevantFiles = await codeAnalyzer.getRelevantFiles(editor.document.uri);
                const context = await codeAnalyzer.consolidateCode(relevantFiles);
                
                progress.report({ increment: 50, message: "Sending to AI..." });
                
                const response = await llmService.sendPrompt(
                    `Analyze this Python code and provide suggestions:\n\n${context}`,
                    context
                );
                
                chatProvider.addMessage('assistant', response);
                vscode.commands.executeCommand('intellipyChat.focus');
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    let chatCommand = vscode.commands.registerCommand('intellipy.chat', () => {
        vscode.commands.executeCommand('intellipyChat.focus');
    });

    let applyChangesCommand = vscode.commands.registerCommand('intellipy.applyChanges', async (fileUpdates: Map<string, string>) => {
        try {
            let filesUpdated = 0;
            for (const [filePath, newContent] of fileUpdates) {
                const uri = vscode.Uri.file(filePath);
                const edit = new vscode.WorkspaceEdit();
                
                // Get the current document content to create proper range
                const document = await vscode.workspace.openTextDocument(uri);
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                );
                
                edit.replace(uri, fullRange, newContent);
                const success = await vscode.workspace.applyEdit(edit);
                
                if (success) {
                    filesUpdated++;
                }
            }
            
            vscode.window.showInformationMessage(`Applied changes to ${filesUpdated} file(s)`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error applying changes: ${error}`);
        }
    });

    let showDiffCommand = vscode.commands.registerCommand('intellipy.showDiff', async (filePath: string, newContent: string) => {
        try {
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const originalContent = document.getText();
            
            // Create a temporary URI for the modified content
            const modifiedUri = uri.with({ scheme: 'intellipy-modified', query: uri.toString() });
            
            // Register a content provider for the modified content
            const contentProvider = new class implements vscode.TextDocumentContentProvider {
                provideTextDocumentContent(): string {
                    return newContent;
                }
            };
            
            const disposable = vscode.workspace.registerTextDocumentContentProvider('intellipy-modified', contentProvider);
            context.subscriptions.push(disposable);
            
            // Show diff
            await vscode.commands.executeCommand('vscode.diff', uri, modifiedUri, `${vscode.workspace.asRelativePath(uri)} ↔ AI Suggestion`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error showing diff: ${error}`);
        }
    });

    // New inline chat command
    let inlineChatCommand = vscode.commands.registerCommand('intellipy.inlineChat', async (message?: string, range?: vscode.Range) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        
        await inlineChatProvider.showInlineChat(editor, message, range);
    });

    // Mode switching commands
    let setAskModeCommand = vscode.commands.registerCommand('intellipy.setAskMode', () => {
        chatModeManager.setMode(ChatMode.Ask);
        chatProvider.updateMode(ChatMode.Ask);
        vscode.window.showInformationMessage('IntelliPy: Ask mode activated');
    });

    let setEditModeCommand = vscode.commands.registerCommand('intellipy.setEditMode', () => {
        chatModeManager.setMode(ChatMode.Edit);
        chatProvider.updateMode(ChatMode.Edit);
        vscode.window.showInformationMessage('IntelliPy: Edit mode activated');
    });

    let setAgentModeCommand = vscode.commands.registerCommand('intellipy.setAgentMode', () => {
        chatModeManager.setMode(ChatMode.Agent);
        chatProvider.updateMode(ChatMode.Agent);
        vscode.window.showInformationMessage('IntelliPy: Agent mode activated');
    });

    context.subscriptions.push(
        analyzeCommand, 
        chatCommand, 
        applyChangesCommand, 
        showDiffCommand,
        inlineChatCommand,
        setAskModeCommand,
        setEditModeCommand,
        setAgentModeCommand
    );
}

export function deactivate() {}