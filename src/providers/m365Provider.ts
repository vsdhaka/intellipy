import * as vscode from 'vscode';
import { LLMProvider } from './base';

/**
 * Simplified Microsoft 365 Copilot Provider
 * Just opens the browser to M365 Copilot - no complex Graph API integration
 */
export class M365CopilotProvider implements LLMProvider {
    getName(): string {
        return 'Microsoft 365 Copilot';
    }

    async sendMessage(message: string, context?: any): Promise<string> {
        try {
            // Encode the message for URL
            const encodedMessage = encodeURIComponent(message);
            const m365Url = `https://m365.cloud.microsoft.com/chat/?auth=1&q=${encodedMessage}`;
            
            // Open browser to M365 Copilot
            await vscode.env.openExternal(vscode.Uri.parse(m365Url));
            
            // Show user guidance
            const userChoice = await vscode.window.showInformationMessage(
                'Opening Microsoft 365 Copilot in your browser with your query pre-filled. Please complete your conversation there.',
                { modal: false },
                'Got it',
                'Copy Query'
            );
            
            if (userChoice === 'Copy Query') {
                await vscode.env.clipboard.writeText(message);
                vscode.window.showInformationMessage('Query copied to clipboard!');
            }
            
            return 'Microsoft 365 Copilot opened in browser. Please continue your conversation there.';
            
        } catch (error: any) {
            console.error('M365 Copilot error:', error);
            
            // Fallback: just copy to clipboard and show instructions
            await vscode.env.clipboard.writeText(message);
            
            return `Unable to open M365 Copilot directly. Your query has been copied to clipboard:

"${message}"

Please:
1. Open https://m365.cloud.microsoft.com/chat/?auth=1 in your browser
2. Paste your query into M365 Copilot
3. Continue your conversation there

Note: You need a Microsoft 365 Business license with Copilot access.`;
        }
    }

    /**
     * Check if user has access to M365 Copilot
     */
    async checkAccess(): Promise<boolean> {
        try {
            const choice = await vscode.window.showInformationMessage(
                'Would you like to test your Microsoft 365 Copilot access?',
                'Test Access',
                'Later'
            );
            
            if (choice === 'Test Access') {
                await vscode.env.openExternal(vscode.Uri.parse('https://m365.cloud.microsoft.com/chat/?auth=1'));
                return true;
            }
            
            return false;
        } catch {
            return false;
        }
    }
}
