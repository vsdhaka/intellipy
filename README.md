# IntelliPy - Intelligent Python Coding Assistant

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

## 🚀 Overview

IntelliPy is an advanced AI-powered coding assistant for Python development in VS Code. It seamlessly integrates with multiple LLM providers to provide intelligent code analysis, suggestions, and automated refactoring while keeping your code private and secure.

## ✨ Features

- **🤖 Multi-LLM Support**: AWS Bedrock (Claude, Titan), Google Gemini, and local models (Ollama, llama.cpp)
- **🎯 Smart Context Detection**: Automatically analyzes your Python codebase
- **💡 Intelligent Suggestions**: AI-powered code improvements and refactoring
- **🔒 Privacy First**: Run entirely offline with local models
- **⚡ Fast & Efficient**: Optimized context gathering for quick responses
- **🛠️ Easy Configuration**: Simple JSON configuration for all providers

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "IntelliPy"
4. Click Install

### From VSIX
```bash
code --install-extension intellipy-0.1.0.vsix
```

## 🔧 Configuration

### AWS Bedrock (Claude)
```json
{
  "intellipy.llmProvider": "bedrock",
  "intellipy.awsRegion": "us-east-1",
  "intellipy.modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0"
}
```

### Google Gemini
```json
{
  "intellipy.llmProvider": "gemini",
  "intellipy.geminiApiKey": "your-api-key",
  "intellipy.geminiModel": "gemini-pro"
}
```

### Local Models (Ollama)
```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customEndpoint": "http://localhost:11434/api/generate",
  "intellipy.customModel": "codellama",
  "intellipy.customFormat": "ollama"
}
```

## 🎮 Usage

1. Open a Python file in VS Code
2. Click the IntelliPy icon in the sidebar
3. Start chatting with your AI assistant
4. Use @ mentions to include specific files: `@file.py`

### Commands

- `IntelliPy: Open Chat` - Open the chat interface
- `IntelliPy: Analyze Code` - Analyze current file
- `IntelliPy: Apply Suggested Changes` - Apply AI suggestions
- `IntelliPy: Show Diff View` - Preview changes

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