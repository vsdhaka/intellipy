import * as vscode from 'vscode';
import { ProviderFactory, ProviderType } from '../providers/providerFactory';
import { BedrockProvider } from '../providers/bedrockProvider';
import { M365CopilotProvider } from '../providers/m365Provider';
import { CustomProvider } from '../providers/customProvider';

/**
 * Command handlers for IntelliPy
 */
export class CommandHandlers {
    /**
     * Generate code from selection command
     */
    static async generateCodeFromSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected. Please select some text to generate code.');
            return;
        }

        const config = vscode.workspace.getConfiguration('intellipy');
        const providerName = config.get<ProviderType>('llmProvider', 'bedrock');
        const providerLabel = providerName === 'bedrock' ? 'AWS Bedrock' : 
                            providerName === 'm365copilot' ? 'Microsoft 365 Copilot' : 'Custom Server';

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Generating code with ${providerLabel}...`,
            cancellable: false
        }, async (progress) => {
            try {
                const response = await ProviderFactory.getResponse(`
Please analyze and improve this code:

${selectedText}

Provide suggestions for:
1. Code optimization
2. Best practices 
3. Potential bugs or issues
4. Alternative implementations if applicable

Language: ${editor.document.languageId}
`);

                await editor.edit(builder => {
                    const lineNumber = selection.end.line;
                    builder.insert(new vscode.Position(lineNumber + 1, 0), `\n/* IntelliPy AI Suggestions:\n${response}\n*/\n`);
                });

                vscode.window.showInformationMessage('Code analysis completed!');

            } catch (error: any) {
                console.error('Code generation error:', error);
                vscode.window.showErrorMessage(`Code generation failed: ${error.message}`);
            }
        });
    }

    /**
     * Toggle inline completions command
     */
    static async toggleInlineCompletions(): Promise<void> {
        const config = vscode.workspace.getConfiguration('intellipy');
        const currentValue = config.get('enableInlineCompletions', true);
        await config.update('enableInlineCompletions', !currentValue, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`IntelliPy inline completions ${!currentValue ? 'enabled' : 'disabled'}`);
    }

    /**
     * Provider selection command
     */
    static async selectProvider(): Promise<void> {
        const items = ProviderFactory.getProviderItems();

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select your AI provider',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            const config = vscode.workspace.getConfiguration('intellipy');
            await config.update('llmProvider', selected.value, vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage(`AI provider switched to ${selected.label.replace(/\$\([^)]+\)\s*/, '')}`);
            
            // Provider-specific setup guidance
            await CommandHandlers.handleProviderSetup(selected.value);
        }
    }

    /**
     * Handle provider-specific setup
     */
    private static async handleProviderSetup(providerType: ProviderType): Promise<void> {
        const config = vscode.workspace.getConfiguration('intellipy');

        switch (providerType) {
            case 'm365copilot':
                const m365Choice = await vscode.window.showInformationMessage(
                    'Microsoft 365 Copilot selected. Would you like to test your access?',
                    'Test Access',
                    'Later'
                );
                
                if (m365Choice === 'Test Access') {
                    const provider = new M365CopilotProvider();
                    await provider.checkAccess();
                }
                break;

            case 'custom':
                const customChoice = await vscode.window.showInformationMessage(
                    'Custom server selected. You need to configure your endpoint URL.',
                    'Configure Now',
                    'Instructions',
                    'Later'
                );
                
                if (customChoice === 'Configure Now') {
                    const endpoint = await vscode.window.showInputBox({
                        prompt: 'Enter your custom AI server endpoint URL:',
                        placeHolder: 'https://your-ai-server.com/api/chat',
                        validateInput: (value) => {
                            if (!value) return 'URL is required';
                            if (!CustomProvider.isValidEndpoint(value)) {
                                return 'Please enter a valid URL';
                            }
                            return null;
                        }
                    });
                    
                    if (endpoint) {
                        await config.update('customEndpoint', endpoint, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage('Custom endpoint configured successfully!');
                    }
                } else if (customChoice === 'Instructions') {
                    vscode.window.showInformationMessage(
                        'To use a custom server:\n' +
                        '1. Set up your AI server with REST API endpoint\n' +
                        '2. Configure the endpoint in IntelliPy settings\n' +
                        '3. Ensure your server accepts POST requests with JSON payload\n' +
                        '4. Expected response format: {"response": "AI response text"}'
                    );
                }
                break;

            case 'bedrock':
                const bedrockChoice = await vscode.window.showInformationMessage(
                    'AWS Bedrock selected (default). Ensure you have AWS credentials configured.',
                    'Test Access',
                    'Setup Guide',
                    'Later'
                );
                
                if (bedrockChoice === 'Test Access') {
                    try {
                        const provider = new BedrockProvider();
                        const success = await provider.testAccess();
                        if (success) {
                            vscode.window.showInformationMessage('✅ AWS Bedrock access confirmed!');
                        } else {
                            vscode.window.showErrorMessage('❌ AWS Bedrock access test failed');
                        }
                    } catch (error: any) {
                        vscode.window.showErrorMessage(`❌ AWS Bedrock access failed: ${error.message}`);
                    }
                } else if (bedrockChoice === 'Setup Guide') {
                    vscode.env.openExternal(vscode.Uri.parse('https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html'));
                }
                break;
        }
    }
}

/**
 * Register all commands
 */
export function registerCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    return [
        vscode.commands.registerCommand('intellipy.generateCode', CommandHandlers.generateCodeFromSelection),
        vscode.commands.registerCommand('intellipy.toggleInlineCompletions', CommandHandlers.toggleInlineCompletions),
        vscode.commands.registerCommand('intellipy.selectProvider', CommandHandlers.selectProvider)
    ];
}
