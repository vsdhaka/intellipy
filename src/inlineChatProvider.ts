import * as vscode from 'vscode';
import { ChatModeManager } from './chatModeManager';
import { ChatMode } from './types';

export class InlineChatProvider implements vscode.CodeActionProvider {
    private decorationType: vscode.TextEditorDecorationType;
    private activeInlineChat: InlineChatWidget | null = null;

    constructor(
        private chatModeManager: ChatModeManager
    ) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' 💬',
                color: new vscode.ThemeColor('editorCodeLens.foreground'),
                fontStyle: 'normal'
            }
        });
    }

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): Promise<vscode.CodeAction[]> {
        const codeActions: vscode.CodeAction[] = [];

        // Quick fix action
        const fixAction = new vscode.CodeAction(
            'IntelliPy: Fix this',
            vscode.CodeActionKind.QuickFix
        );
        fixAction.command = {
            command: 'intellipy.inlineChat',
            title: 'Fix this',
            arguments: ['Fix this code', range]
        };
        codeActions.push(fixAction);

        // Explain action
        const explainAction = new vscode.CodeAction(
            'IntelliPy: Explain this',
            vscode.CodeActionKind.Empty
        );
        explainAction.command = {
            command: 'intellipy.inlineChat',
            title: 'Explain this',
            arguments: ['Explain this code', range]
        };
        codeActions.push(explainAction);

        // Refactor action
        const refactorAction = new vscode.CodeAction(
            'IntelliPy: Refactor this',
            vscode.CodeActionKind.Refactor
        );
        refactorAction.command = {
            command: 'intellipy.inlineChat',
            title: 'Refactor this',
            arguments: ['Refactor this code for better readability', range]
        };
        codeActions.push(refactorAction);

        return codeActions;
    }

    async showInlineChat(editor: vscode.TextEditor, message?: string, range?: vscode.Range) {
        // Clean up any existing inline chat
        this.hideInlineChat();

        // Get the current selection or cursor position
        const selection = range || editor.selection;
        const position = selection.end;

        // Create inline chat widget
        this.activeInlineChat = new InlineChatWidget(
            editor,
            position,
            message,
            async (userMessage: string) => {
                // Process the message in edit mode
                const previousMode = this.chatModeManager.getMode();
                this.chatModeManager.setMode(ChatMode.Edit);

                const context = {
                    files: [{
                        uri: editor.document.uri,
                        content: editor.document.getText(),
                        relativePath: vscode.workspace.asRelativePath(editor.document.uri)
                    }],
                    selectedText: editor.document.getText(selection)
                };

                const response = await this.chatModeManager.processMessage(userMessage, context);
                
                // Apply the edit if available
                if (response.metadata?.edits && response.metadata.edits.length > 0) {
                    const edit = response.metadata.edits[0];
                    await this.applyEdit(editor, selection, edit.newContent);
                }

                // Restore previous mode
                this.chatModeManager.setMode(previousMode);
                this.hideInlineChat();
            }
        );

        this.activeInlineChat.show();
    }

    hideInlineChat() {
        if (this.activeInlineChat) {
            this.activeInlineChat.dispose();
            this.activeInlineChat = null;
        }
    }

    private async applyEdit(editor: vscode.TextEditor, range: vscode.Range, newText: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, range, newText);
        await vscode.workspace.applyEdit(edit);
    }
}

class InlineChatWidget {
    private panel: vscode.WebviewPanel | null = null;
    private inputBox: vscode.InputBox | null = null;

    constructor(
        private editor: vscode.TextEditor,
        private position: vscode.Position,
        private initialMessage: string | undefined,
        private onSubmit: (message: string) => Promise<void>
    ) {}

    show() {
        // For simplicity, we'll use an input box for now
        // In a full implementation, this would be a webview overlay
        this.inputBox = vscode.window.createInputBox();
        this.inputBox.placeholder = 'Ask IntelliPy to edit this code...';
        this.inputBox.value = this.initialMessage || '';
        this.inputBox.ignoreFocusOut = false;

        this.inputBox.onDidAccept(async () => {
            const message = this.inputBox!.value;
            if (message) {
                this.inputBox!.enabled = false;
                this.inputBox!.busy = true;
                await this.onSubmit(message);
            }
        });

        this.inputBox.onDidHide(() => {
            this.dispose();
        });

        this.inputBox.show();
    }

    dispose() {
        if (this.inputBox) {
            this.inputBox.dispose();
            this.inputBox = null;
        }
        if (this.panel) {
            this.panel.dispose();
            this.panel = null;
        }
    }
}