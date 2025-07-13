# IntelliPy - Privacy-First Python AI Assistant

<p align="center">
  <img src="icon.png" alt="IntelliPy Logo" width="128" height="128">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy">
    <img src="https://img.shields.io/visual-studio-marketplace/v/intellipy-dev.intellipy.svg?color=blue&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="VS Code Marketplace">
  </a>
  <a href="https://github.com/vsdhaka/intellipy/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/intellipy/intellipy-vscode.svg" alt="License">
  </a>
  <a href="https://intellipy.com">
    <img src="https://img.shields.io/badge/website-intellipy.com-blue" alt="Website">
  </a>
</p>

## 🔒 Privacy First

**IntelliPy respects your privacy:**
- ✅ **No telemetry or analytics** - We don't track you
- ✅ **No external dependencies** - Everything runs locally
- ✅ **Your choice of LLM** - Use AWS, Google, or run completely offline
- ✅ **Transparent operations** - You control where your code goes
- ✅ **Open source** - Verify our privacy claims yourself

[Read our detailed Privacy Guide →](PRIVACY.md)

## 🚀 Overview

IntelliPy is an advanced AI-powered coding assistant for Python development in VS Code. Unlike other assistants, IntelliPy gives you complete control over your AI provider while maintaining enterprise-grade security and privacy.

## ✨ Features

### Core Features
- **🤖 Multi-LLM Support**: Choose your AI provider - AWS Bedrock, Google Gemini, Microsoft 365 Copilot, or local models
- **🎯 Smart Context**: Automatically analyzes and includes relevant Python files
- **💬 Advanced Chat Modes**: Ask questions, edit code, or run autonomous agents
- **⌨️ Inline Chat**: Quick edits with Ctrl+I (Cmd+I on Mac)
- **📝 @ Mentions**: Reference specific files or entire workspace with @file or @workspace
- **🛡️ Safety First**: Confirmation prompts for all file modifications
- **🏢 Microsoft 365 Integration**: Seamlessly use your enterprise Copilot subscription

### Privacy & Security
- **🔒 100% Private**: Your code never leaves your configured LLM
- **🏢 Enterprise Ready**: Full support for AWS SSO and corporate proxies
- **💾 Offline Mode**: Run completely offline with local models
- **🔍 Transparent**: All operations are visible and auditable

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "IntelliPy"
4. Click Install

### From VSIX
```bash
code --install-extension intellipy-0.2.1.vsix
```

## 🔧 Quick Setup

### Option 1: AWS Bedrock (Enterprise)
```json
{
  "intellipy.llmProvider": "bedrock",
  "intellipy.bedrock.region": "us-east-1",
  "intellipy.bedrock.modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0"
}
```
**Authentication**: Uses AWS CLI credentials automatically. [Setup Guide →](PRIVACY.md#aws-bedrock-setup)

### Option 2: Google Gemini (Personal)
```json
{
  "intellipy.llmProvider": "gemini",
  "intellipy.gemini.apiKey": "your-api-key",
  "intellipy.gemini.model": "gemini-1.5-flash"
}
```
**Get API Key**: https://makersuite.google.com/app/apikey

### Option 3: Microsoft 365 Copilot (Enterprise - Experimental)
```json
{
  "intellipy.llmProvider": "microsoft365"
}
```
**Note**: Microsoft 365 Copilot API integration is experimental and may not be available yet. This feature requires Microsoft to enable API access for Copilot.

### Option 4: Local Models (Maximum Privacy)
```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customServer.endpoint": "http://localhost:11434/api/chat",
  "intellipy.customServer.model": "codellama"
}
```
**Supported**: Ollama, llama.cpp, LocalAI, or any OpenAI-compatible endpoint

## 🎮 Usage

### Chat Interface
1. Click the IntelliPy icon in the sidebar
2. Choose your mode:
   - **Ask**: Questions about code
   - **Edit**: Direct code modifications  
   - **Agent**: Multi-step tasks
3. Use @ mentions to control context:
   - `@file.py` - Include specific file
   - `@workspace` - Include entire project

### Inline Chat (Ctrl+I)
1. Select code in editor
2. Press Ctrl+I (Cmd+I on Mac)
3. Type your request
4. IntelliPy edits code in-place

### Commands
- `IntelliPy: Open Chat` - Open the chat interface
- `IntelliPy: Inline Chat` - Quick edits (Ctrl+I)
- `IntelliPy: Set Ask/Edit/Agent Mode` - Switch chat modes

## 🏗️ Architecture

```
intellipy/
├── src/
│   ├── extension.ts          # Main extension entry
│   ├── codeAnalyzer.ts       # Code analysis logic
│   ├── llmService.ts         # LLM provider abstraction
│   └── chatViewProvider.ts   # Chat UI implementation
├── media/
│   └── main.css             # Chat interface styles
└── package.json             # Extension manifest
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/vsdhaka/intellipy.git
cd intellipy-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in development
# Press F5 in VS Code
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

- 🐛 [Report Issues](https://github.com/vsdhaka/intellipy/issues)
- 💬 [Discussions](https://github.com/vsdhaka/intellipy/discussions)
- 📧 [Contact](mailto:support@intellipy.com)

## 🙏 Acknowledgments

Built with ❤️ for the Python community. Special thanks to all contributors and users who make IntelliPy better every day.

---

<p align="center">
  <a href="https://intellipy.com">intellipy.com</a> • 
  <a href="https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy">VS Code Marketplace</a> • 
  <a href="https://github.com/vsdhaka/intellipy">GitHub</a>
</p>