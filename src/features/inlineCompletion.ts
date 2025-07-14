import * as vscode from 'vscode';
import { ProviderFactory } from '../providers/providerFactory';

/**
 * Inline completion provider for IntelliPy
 */
export class IntelliPyInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
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

        // Get context around cursor position
        const lineText = document.lineAt(position).text.substring(0, position.character);
        const maxContextLines = Math.min(position.line, 10); // Limit context lines
        const contextLines: string[] = [];

        for (let i = Math.max(0, position.line - maxContextLines); i < position.line; i++) {
            contextLines.push(document.lineAt(i).text);
        }
        contextLines.push(lineText);

        const contextText = contextLines.join('\n');

        // Skip if line is too short or ends with certain characters
        if (lineText.trim().length < 3 || lineText.endsWith('.') || lineText.endsWith(';')) {
            return [];
        }

        try {
            const suggestion = await this.getSuggestion(contextText, document.languageId);
            if (suggestion && suggestion.trim()) {
                return [
                    new vscode.InlineCompletionItem(
                        suggestion,
                        new vscode.Range(position, position)
                    )
                ];
            }
        } catch (error) {
            console.error('Inline completion error:', error);
        }

        return [];
    }

    private async getSuggestion(context: string, languageId: string): Promise<string> {
        const prompt = `Complete this ${languageId} code. Only provide the completion, no explanations:

${context}

Context: You're helping complete code. The user is at the end of the last line. Provide a natural continuation that makes sense in context. Keep it concise and focused on the immediate next logical step.

Completion:`;

        const response = await ProviderFactory.getResponse(prompt);
        return response.trim();
    }
}

/**
 * Register inline completion provider
 */
export function registerInlineCompletions(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new IntelliPyInlineCompletionProvider();
    return vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file' }, // Apply to all file schemes
        provider
    );
}
