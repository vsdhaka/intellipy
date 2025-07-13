import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolResult } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ToolSystem {
    private tools: Map<string, Tool> = new Map();
    private confirmationCache: Map<string, boolean> = new Map();

    constructor() {
        this.registerBuiltInTools();
    }

    private registerBuiltInTools() {
        // File reading tool
        this.registerTool({
            name: 'readFile',
            description: 'Read contents of a file',
            requiresConfirmation: false,
            execute: async (args: { path: string }) => {
                try {
                    const uri = vscode.Uri.file(args.path);
                    const document = await vscode.workspace.openTextDocument(uri);
                    return {
                        success: true,
                        output: document.getText()
                    };
                } catch (error) {
                    return {
                        success: false,
                        output: '',
                        error: `Failed to read file: ${error}`
                    };
                }
            }
        });

        // File writing tool
        this.registerTool({
            name: 'writeFile',
            description: 'Write content to a file',
            requiresConfirmation: true,
            execute: async (args: { path: string, content: string }) => {
                try {
                    const uri = vscode.Uri.file(args.path);
                    const edit = new vscode.WorkspaceEdit();
                    
                    if (fs.existsSync(args.path)) {
                        // Update existing file
                        const document = await vscode.workspace.openTextDocument(uri);
                        const fullRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(document.getText().length)
                        );
                        edit.replace(uri, fullRange, args.content);
                    } else {
                        // Create new file
                        edit.createFile(uri, { ignoreIfExists: false });
                        edit.insert(uri, new vscode.Position(0, 0), args.content);
                    }
                    
                    await vscode.workspace.applyEdit(edit);
                    return {
                        success: true,
                        output: `File written: ${args.path}`
                    };
                } catch (error) {
                    return {
                        success: false,
                        output: '',
                        error: `Failed to write file: ${error}`
                    };
                }
            }
        });

        // Terminal command tool
        this.registerTool({
            name: 'runCommand',
            description: 'Execute a terminal command',
            requiresConfirmation: true,
            execute: async (args: { command: string, cwd?: string }) => {
                try {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    const cwd = args.cwd || (workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd());
                    
                    const { stdout, stderr } = await execAsync(args.command, { cwd });
                    
                    return {
                        success: true,
                        output: stdout || stderr
                    };
                } catch (error: any) {
                    return {
                        success: false,
                        output: '',
                        error: `Command failed: ${error.message}`
                    };
                }
            }
        });

        // Search tool
        this.registerTool({
            name: 'searchFiles',
            description: 'Search for text in files',
            requiresConfirmation: false,
            execute: async (args: { query: string, include?: string, exclude?: string }) => {
                try {
                    const results: string[] = [];
                    const includePattern = args.include || '**/*.py';
                    const excludePattern = args.exclude || '**/node_modules/**';
                    
                    const files = await vscode.workspace.findFiles(includePattern, excludePattern);
                    
                    for (const file of files) {
                        const document = await vscode.workspace.openTextDocument(file);
                        const text = document.getText();
                        
                        if (text.includes(args.query)) {
                            const relativePath = vscode.workspace.asRelativePath(file);
                            const lines = text.split('\n');
                            const matches: string[] = [];
                            
                            lines.forEach((line, index) => {
                                if (line.includes(args.query)) {
                                    matches.push(`  ${index + 1}: ${line.trim()}`);
                                }
                            });
                            
                            if (matches.length > 0) {
                                results.push(`${relativePath}:\n${matches.slice(0, 5).join('\n')}`);
                            }
                        }
                    }
                    
                    return {
                        success: true,
                        output: results.join('\n\n') || 'No matches found'
                    };
                } catch (error) {
                    return {
                        success: false,
                        output: '',
                        error: `Search failed: ${error}`
                    };
                }
            }
        });

        // Create file tool
        this.registerTool({
            name: 'createFile',
            description: 'Create a new file',
            requiresConfirmation: true,
            execute: async (args: { path: string, content?: string }) => {
                try {
                    const uri = vscode.Uri.file(args.path);
                    const edit = new vscode.WorkspaceEdit();
                    edit.createFile(uri, { ignoreIfExists: false });
                    
                    if (args.content) {
                        edit.insert(uri, new vscode.Position(0, 0), args.content);
                    }
                    
                    await vscode.workspace.applyEdit(edit);
                    await vscode.window.showTextDocument(uri);
                    
                    return {
                        success: true,
                        output: `Created file: ${args.path}`
                    };
                } catch (error) {
                    return {
                        success: false,
                        output: '',
                        error: `Failed to create file: ${error}`
                    };
                }
            }
        });

        // Delete file tool
        this.registerTool({
            name: 'deleteFile',
            description: 'Delete a file',
            requiresConfirmation: true,
            execute: async (args: { path: string }) => {
                try {
                    const uri = vscode.Uri.file(args.path);
                    const edit = new vscode.WorkspaceEdit();
                    edit.deleteFile(uri);
                    await vscode.workspace.applyEdit(edit);
                    
                    return {
                        success: true,
                        output: `Deleted file: ${args.path}`
                    };
                } catch (error) {
                    return {
                        success: false,
                        output: '',
                        error: `Failed to delete file: ${error}`
                    };
                }
            }
        });
    }

    registerTool(tool: Tool) {
        this.tools.set(tool.name, tool);
    }

    async executeTool(toolName: string, args: any): Promise<ToolResult> {
        const tool = this.tools.get(toolName);
        
        if (!tool) {
            return {
                success: false,
                output: '',
                error: `Tool '${toolName}' not found`
            };
        }

        // Check if confirmation is required
        if (tool.requiresConfirmation) {
            const confirmed = await this.confirmToolExecution(toolName, args);
            if (!confirmed) {
                return {
                    success: false,
                    output: '',
                    error: 'User cancelled the operation'
                };
            }
        }

        // Execute the tool
        return await tool.execute(args);
    }

    private async confirmToolExecution(toolName: string, args: any): Promise<boolean> {
        const cacheKey = `${toolName}-${JSON.stringify(args)}`;
        
        // Check cache
        if (this.confirmationCache.has(cacheKey)) {
            return this.confirmationCache.get(cacheKey)!;
        }

        // Show confirmation dialog
        const detail = this.formatToolConfirmation(toolName, args);
        const result = await vscode.window.showWarningMessage(
            `IntelliPy wants to execute: ${toolName}`,
            {
                modal: true,
                detail
            },
            'Allow',
            'Allow Always',
            'Cancel'
        );

        if (result === 'Allow') {
            return true;
        } else if (result === 'Allow Always') {
            this.confirmationCache.set(cacheKey, true);
            return true;
        }

        return false;
    }

    private formatToolConfirmation(toolName: string, args: any): string {
        switch (toolName) {
            case 'writeFile':
                return `Write to file: ${args.path}`;
            case 'runCommand':
                return `Run command: ${args.command}`;
            case 'createFile':
                return `Create file: ${args.path}`;
            case 'deleteFile':
                return `Delete file: ${args.path}`;
            default:
                return JSON.stringify(args, null, 2);
        }
    }

    getAvailableTools(): string[] {
        return Array.from(this.tools.keys());
    }

    getToolDescription(toolName: string): string | undefined {
        return this.tools.get(toolName)?.description;
    }
}