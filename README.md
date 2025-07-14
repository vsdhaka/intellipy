# 🤖 IntelliPy v2.0.1 - AI Code Assistant

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy)
[![GitHub](https://img.shields.io/github/license/vsdhaka/intellipy)](https://github.com/vsdhaka/intellipy/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.1-brightgreen)](package.json)

> **GitHub Copilot-like experience with multiple AI providers**

IntelliPy brings AI-powered coding assistance to VS Code with support for multiple providers including AWS Bedrock, Microsoft 365 Copilot, and custom endpoints.

🌐 **[Website](https://intellipy.com)** | 📖 **[Documentation](docs/)** | 🐛 **[Issues](https://github.com/vsdhaka/intellipy/issues)**

## ✨ Features

### 🔮 **Inline Code Completions**
- Real-time AI suggestions as you type
- Context-aware completions for all programming languages
- GitHub Copilot-like experience

### 💬 **Interactive Chat Interface**  
- Dedicated chat panel for code discussions
- Ask questions, get explanations, debug issues
- Beautiful, responsive UI with VS Code theming

### 🔄 **Multiple AI Providers**
- **AWS Bedrock** (default) - Privacy-first with Claude & Titan models
- **Microsoft 365 Copilot** - Simple browser integration  
- **Custom Server** - Connect to your own AI endpoint

### ⚡ **Smart Code Generation**
- Generate code from text selections
- AI-powered code analysis and suggestions
- Context-aware improvements and optimizations

## 🚀 Quick Start

### 1. Install
Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy) or:
```bash
code --install-extension intellipy-dev.intellipy
```

### 2. Select Provider
`Ctrl+Shift+P` → "IntelliPy: Select AI Provider"

### 3. Start Coding!
Begin typing and get AI-powered suggestions, or open the chat panel with `Ctrl+Shift+I`.

## 🔧 Provider Setup

### 🔶 AWS Bedrock (Recommended)
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure credentials
aws configure

# Ensure Bedrock access in your region
```

### 🔷 Microsoft 365 Copilot
- Requires M365 Business license with Copilot access
- No configuration needed - opens in browser
- Click to test access directly

### ⚙️ Custom Server
- Configure your endpoint URL in settings
- REST API with JSON request/response format:
```json
// Request
{
  "message": "user query",
  "context": "additional context"
}

// Response  
{
  "response": "AI response text"
}
```

## 🎯 Commands & Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| `IntelliPy: Generate Code` | `Ctrl+Shift+B` | Generate code from selection |
| `IntelliPy: Open Chat` | `Ctrl+Shift+I` | Open AI chat interface |
| `IntelliPy: Select Provider` | - | Switch between AI providers |
| `IntelliPy: Toggle Completions` | - | Enable/disable inline completions |

## 🏗️ Architecture v2.0

Clean, modular architecture for maintainability:

```
src/
├── extension.ts              # Main entry point (43 lines)
├── providers/               # AI provider implementations
│   ├── base.ts             # Provider interface
│   ├── bedrockProvider.ts  # AWS Bedrock integration
│   ├── m365Provider.ts     # M365 Copilot (browser-based)
│   ├── customProvider.ts   # Custom endpoint support
│   └── providerFactory.ts  # Provider management
└── features/               # Core features
    ├── chat.ts            # Chat webview interface
    ├── commands.ts        # Command handlers
    └── inlineCompletion.ts # Inline completion provider
```

## 🔒 Privacy & Security

### AWS Bedrock (Default)
- ✅ **Privacy-first** - Your code goes only to your AWS account
- ✅ **No data retention** - AWS Bedrock doesn't store your data
- ✅ **Enterprise-grade** - SOC 2, ISO 27001, HIPAA compliant
- ✅ **Transparent** - All API calls are auditable

### Microsoft 365 Copilot
- ✅ **Browser-based** - Uses your existing M365 session
- ✅ **No local storage** - Queries processed in M365 environment
- ✅ **Enterprise compliance** - Inherits your M365 security policies

### Custom Server
- ⚠️ **Your responsibility** - Security depends on your endpoint
- ✅ **Full control** - You manage the entire data flow

## 🛠️ Development

### Project Structure
```bash
# Install dependencies
npm install

# Build for development
npm run esbuild

# Build for production
npm run esbuild-prod

# Package extension
npx vsce package
```

### Key Files
- `package.json` - Extension manifest and dependencies
- `src/extension.ts` - Main activation point
- `src/providers/` - AI provider implementations
- `src/features/` - Feature modules
- `docs/development/` - Development documentation

## 📝 Configuration

Configure IntelliPy through VS Code settings:

```json
{
  "intellipy.llmProvider": "bedrock",           // Provider: bedrock|m365copilot|custom
  "intellipy.enableInlineCompletions": true,   // Enable inline suggestions
  "intellipy.awsRegion": "us-east-1",         // AWS region for Bedrock
  "intellipy.modelId": "anthropic.claude-3-sonnet-20240229-v1:0", // Bedrock model
  "intellipy.customEndpoint": ""               // Custom server URL
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS Bedrock team for the powerful AI models
- Microsoft for M365 Copilot integration possibilities  
- VS Code team for the excellent extension API
- Open source community for inspiration and feedback

---

**Made with ❤️ by [vsdhaka](https://github.com/vsdhaka)**
