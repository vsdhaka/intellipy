import * as vscode from 'vscode';

export enum ChatMode {
    Ask = 'ask',
    Edit = 'edit', 
    Agent = 'agent'
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    mode?: ChatMode;
    metadata?: MessageMetadata;
}

export interface MessageMetadata {
    files?: string[];
    symbols?: string[];
    workspace?: boolean;
    toolsUsed?: Tool[];
    edits?: FileEdit[];
}

export interface FileEdit {
    uri: vscode.Uri;
    originalContent: string;
    newContent: string;
    applied: boolean;
}

export interface Tool {
    name: string;
    description: string;
    execute: (args: any) => Promise<ToolResult>;
    requiresConfirmation: boolean;
}

export interface ToolResult {
    success: boolean;
    output: string;
    error?: string;
}

export interface MentionableItem {
    type: 'file' | 'symbol' | 'workspace';
    label: string;
    detail?: string;
    uri?: vscode.Uri;
    range?: vscode.Range;
}

export interface ChatSession {
    id: string;
    mode: ChatMode;
    messages: ChatMessage[];
    context: ChatContext;
}

export interface ChatContext {
    activeFile?: vscode.Uri;
    selectedText?: string;
    workspaceFiles?: vscode.Uri[];
    referencedFiles: Set<string>;
    referencedSymbols: Set<string>;
}