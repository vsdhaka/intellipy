import * as vscode from 'vscode';
import * as path from 'path';

export interface FileContext {
    uri: vscode.Uri;
    content: string;
    relativePath: string;
}

export class CodeAnalyzer {
    private readonly pythonExtensions = ['.py', '.pyi'];
    private readonly maxFileSize = 100000; // 100KB
    private readonly maxFiles = 10;

    async getRelevantFiles(currentFile: vscode.Uri): Promise<FileContext[]> {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFile);
        if (!workspaceFolder) {
            return [];
        }

        const relevantFiles: FileContext[] = [];
        const currentFileContent = await this.readFile(currentFile);
        
        // Add current file
        relevantFiles.push({
            uri: currentFile,
            content: currentFileContent,
            relativePath: vscode.workspace.asRelativePath(currentFile)
        });

        // Find imports in current file
        const imports = this.extractImports(currentFileContent);
        
        // Find files that might be related
        const relatedFiles = await this.findRelatedFiles(currentFile, imports, workspaceFolder);
        
        // Add related files up to max limit
        for (const file of relatedFiles) {
            if (relevantFiles.length >= this.maxFiles) break;
            
            const content = await this.readFile(file);
            if (content.length <= this.maxFileSize) {
                relevantFiles.push({
                    uri: file,
                    content: content,
                    relativePath: vscode.workspace.asRelativePath(file)
                });
            }
        }

        return relevantFiles;
    }

    async consolidateCode(files: FileContext[]): Promise<string> {
        const consolidatedParts: string[] = [];
        
        for (const file of files) {
            consolidatedParts.push(`\n### File: ${file.relativePath}\n`);
            consolidatedParts.push('```python');
            consolidatedParts.push(file.content);
            consolidatedParts.push('```\n');
        }
        
        return consolidatedParts.join('\n');
    }

    private async readFile(uri: vscode.Uri): Promise<string> {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            return document.getText();
        } catch (error) {
            return '';
        }
    }

    private extractImports(content: string): string[] {
        const imports: string[] = [];
        const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const moduleName = match[1] || match[2];
            if (moduleName && !moduleName.startsWith('.')) {
                imports.push(moduleName.split('.')[0]);
            }
        }
        
        return [...new Set(imports)];
    }

    private async findRelatedFiles(
        currentFile: vscode.Uri,
        imports: string[],
        workspaceFolder: vscode.WorkspaceFolder
    ): Promise<vscode.Uri[]> {
        const relatedFiles: vscode.Uri[] = [];
        const currentDir = path.dirname(currentFile.fsPath);
        
        // Search for imported modules
        for (const importName of imports) {
            const pattern = new vscode.RelativePattern(workspaceFolder, `**/${importName}.py`);
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 5);
            relatedFiles.push(...files);
        }
        
        // Search for files in the same directory
        const sameDirPattern = new vscode.RelativePattern(currentDir, '*.py');
        const sameDirFiles = await vscode.workspace.findFiles(sameDirPattern, '**/node_modules/**', 10);
        
        // Search for test files
        const fileName = path.basename(currentFile.fsPath, '.py');
        const testPattern = new vscode.RelativePattern(workspaceFolder, `**/test_${fileName}.py`);
        const testFiles = await vscode.workspace.findFiles(testPattern, '**/node_modules/**', 5);
        
        relatedFiles.push(...sameDirFiles, ...testFiles);
        
        // Remove duplicates and current file
        const uniqueFiles = Array.from(new Set(relatedFiles.map(f => f.fsPath)))
            .map(fsPath => vscode.Uri.file(fsPath))
            .filter(uri => uri.fsPath !== currentFile.fsPath);
        
        return uniqueFiles;
    }

    parseResponse(response: string, originalFiles: FileContext[]): Map<string, string> {
        const fileUpdates = new Map<string, string>();
        const fileBlocks = response.split(/### File: (.*?)\n/);
        
        for (let i = 1; i < fileBlocks.length; i += 2) {
            const fileName = fileBlocks[i].trim();
            const content = fileBlocks[i + 1];
            
            // Extract code from markdown blocks
            const codeMatch = content.match(/```(?:python)?\n([\s\S]*?)```/);
            if (codeMatch) {
                const originalFile = originalFiles.find(f => f.relativePath === fileName);
                if (originalFile) {
                    fileUpdates.set(originalFile.uri.fsPath, codeMatch[1].trim());
                }
            }
        }
        
        return fileUpdates;
    }
}