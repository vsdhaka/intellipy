import * as vscode from 'vscode';
import { MentionableItem } from './types';

export class MentionProvider {
    private mentionableItems: Map<string, MentionableItem> = new Map();

    constructor() {
        this.initializeMentions();
    }

    private async initializeMentions() {
        // Add workspace mention
        this.mentionableItems.set('@workspace', {
            type: 'workspace',
            label: '@workspace',
            detail: 'Include all workspace files in context'
        });

        // Update mentions when files change
        const watcher = vscode.workspace.createFileSystemWatcher('**/*.py');
        watcher.onDidCreate(() => this.updateFileMentions());
        watcher.onDidDelete(() => this.updateFileMentions());
        watcher.onDidChange(() => this.updateFileMentions());

        // Initial file mentions
        await this.updateFileMentions();
    }

    private async updateFileMentions() {
        // Clear existing file mentions
        for (const [key, item] of this.mentionableItems.entries()) {
            if (item.type === 'file') {
                this.mentionableItems.delete(key);
            }
        }

        // Add Python files as mentionable
        const files = await vscode.workspace.findFiles('**/*.py', '**/node_modules/**', 100);
        for (const file of files) {
            const relativePath = vscode.workspace.asRelativePath(file);
            const fileName = relativePath.split('/').pop() || relativePath;
            
            this.mentionableItems.set(`@${fileName}`, {
                type: 'file',
                label: `@${fileName}`,
                detail: relativePath,
                uri: file
            });
        }
    }

    async getMentionCompletions(prefix: string): Promise<MentionableItem[]> {
        const completions: MentionableItem[] = [];
        const searchTerm = prefix.toLowerCase();

        for (const [key, item] of this.mentionableItems.entries()) {
            if (key.toLowerCase().includes(searchTerm)) {
                completions.push(item);
            }
        }

        // Add symbol mentions for the active file
        if (searchTerm.includes('@')) {
            const symbols = await this.getSymbolMentions(searchTerm);
            completions.push(...symbols);
        }

        return completions.slice(0, 20); // Limit results
    }

    private async getSymbolMentions(searchTerm: string): Promise<MentionableItem[]> {
        const symbols: MentionableItem[] = [];
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor) {
            const documentSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                activeEditor.document.uri
            );

            if (documentSymbols) {
                this.flattenSymbols(documentSymbols, symbols, '');
            }
        }

        return symbols.filter(s => s.label.toLowerCase().includes(searchTerm));
    }

    private flattenSymbols(
        symbols: vscode.DocumentSymbol[],
        result: MentionableItem[],
        prefix: string
    ) {
        for (const symbol of symbols) {
            const label = `@${prefix}${symbol.name}`;
            result.push({
                type: 'symbol',
                label,
                detail: `${this.getSymbolKindName(symbol.kind)} in current file`,
                range: symbol.range
            });

            if (symbol.children) {
                this.flattenSymbols(symbol.children, result, `${prefix}${symbol.name}.`);
            }
        }
    }

    private getSymbolKindName(kind: vscode.SymbolKind): string {
        const kinds: { [key: number]: string } = {
            [vscode.SymbolKind.File]: 'File',
            [vscode.SymbolKind.Module]: 'Module',
            [vscode.SymbolKind.Class]: 'Class',
            [vscode.SymbolKind.Method]: 'Method',
            [vscode.SymbolKind.Function]: 'Function',
            [vscode.SymbolKind.Variable]: 'Variable',
            [vscode.SymbolKind.Constant]: 'Constant'
        };
        return kinds[kind] || 'Symbol';
    }

    async resolveMentions(text: string): Promise<{
        resolvedText: string,
        context: {
            files: vscode.Uri[],
            symbols: string[],
            includeWorkspace: boolean
        }
    }> {
        const mentions = this.extractMentions(text);
        const files: vscode.Uri[] = [];
        const symbols: string[] = [];
        let includeWorkspace = false;
        let resolvedText = text;

        for (const mention of mentions) {
            const item = this.mentionableItems.get(mention);
            if (item) {
                switch (item.type) {
                    case 'file':
                        if (item.uri) {
                            files.push(item.uri);
                        }
                        break;
                    case 'symbol':
                        symbols.push(mention);
                        break;
                    case 'workspace':
                        includeWorkspace = true;
                        break;
                }
                // Remove mention from text
                resolvedText = resolvedText.replace(mention, '');
            }
        }

        return {
            resolvedText: resolvedText.trim(),
            context: {
                files,
                symbols,
                includeWorkspace
            }
        };
    }

    private extractMentions(text: string): string[] {
        const mentionRegex = /@[\w\.\-\/]+/g;
        const matches = text.match(mentionRegex);
        return matches || [];
    }
}