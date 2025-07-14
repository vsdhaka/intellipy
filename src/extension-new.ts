import * as vscode from 'vscode';
import { registerInlineCompletions } from './features/inlineCompletion';
import { registerChatCommand } from './features/chat';
import { registerCommands } from './features/commands';

/**
 * IntelliPy Extension Entry Point
 * Simplified and modular architecture
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 IntelliPy extension activated');

    try {
        // Register inline completion provider
        const inlineCompletionDisposable = registerInlineCompletions(context);
        
        // Register chat command
        const chatDisposable = registerChatCommand(context);
        
        // Register all other commands
        const commandDisposables = registerCommands(context);

        // Add all disposables to context
        context.subscriptions.push(
            inlineCompletionDisposable,
            chatDisposable,
            ...commandDisposables
        );

        console.log('✅ IntelliPy extension ready');
        
    } catch (error) {
        console.error('❌ IntelliPy activation failed:', error);
        vscode.window.showErrorMessage(`IntelliPy failed to activate: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Extension deactivation
 */
export function deactivate() {
    console.log('👋 IntelliPy extension deactivated');
}
