# IntelliPy - AI Code Assistant

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy)
[![GitHub](https://img.shields.io/github/license/vsdhaka/intellipy)](https://github.com/vsdhaka/intellipy/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/vsdhaka/intellipy)](https://github.com/vsdhaka/intellipy)

A privacy-first AI coding assistant for VS Code that provides GitHub Copilot-like features powered by AWS Bedrock. Get intelligent code completions, explanations, and chat assistance while maintaining complete control over your data.

🌐 **[Live Demo](https://intellipy.com)** | 📖 **[Documentation](https://github.com/vsdhaka/intellipy)** | 🐛 **[Issues](https://github.com/vsdhaka/intellipy/issues)** | 🚀 **[Cloudflare Pages](https://intellipy.pages.dev)**Py - AI Code Assistant

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=intellipy.intellipy)
[![GitHub](https://img.shields.io/github/license/vsdhaka/intellipy)](https://github.com/vsdhaka/intellipy/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/vsdhaka/intellipy)](https://github.com/vsdhaka/intellipy)

A privacy-first AI coding assistant for VS Code that provides GitHub Copilot-like features powered by AWS Bedrock. Get intelligent code completions, explanations, and chat assistance while maintaining complete control over your data.

🌐 **[Live Demo](https://intellipy.com)** | 📖 **[Documentation](https://github.com/vsdhaka/intellipy)** | 🐛 **[Issues](https://github.com/vsdhaka/intellipy/issues)**

## 🔒 Privacy First

**IntelliPy respects your privacy:**
- ✅ **No telemetry or tracking** - We don't monitor your usage
- ✅ **Your AWS account** - Your code only goes to your own AWS Bedrock
- ✅ **Transparent operations** - All API calls are visible and auditable
- ✅ **Open source** - Verify our privacy claims yourself

## Features

### 🚀 Inline Code Completions
- Real-time code suggestions as you type, just like GitHub Copilot
- Context-aware completions using AWS Bedrock's advanced AI models
- Supports all programming languages with intelligent suggestions

### 💬 Interactive Chat Interface
- Copilot-style chat panel for interactive coding assistance
- Ask questions about your code and get detailed explanations
- Request code improvements and best practices
- Beautiful VS Code-themed interface that feels native

### 🔧 Smart Code Generation
- Select any text and get AI-powered code explanations or improvements
- Context-aware code refactoring suggestions
- Intelligent code analysis and optimization recommendations

### 🎯 Python-Focused Features
- Optimized prompts for Python development
- Understanding of Python best practices and conventions
- Support for modern Python frameworks and libraries

## Installation

1. Install the extension from the generated `.vsix` file:
   ```bash
   code --install-extension intellipy-1.0.0.vsix
   ```

   Or install from the VS Code Marketplace (coming soon).

2. Configure your AWS credentials (choose one method):

   **Option 1: AWS CLI**
   ```bash
   aws configure
   ```

   **Option 2: Environment Variables**
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

   **Option 3: AWS Profile**
   ```bash
   export AWS_PROFILE=your_profile_name
   ```

3. Restart VS Code after configuring credentials.

## Usage

### Inline Completions
- Start typing code in any file
- The extension will automatically suggest completions
- Press `Tab` to accept suggestions
- Press `Escape` to dismiss suggestions

### Chat Interface
- Use `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac) to open the chat panel
- Type your questions about code
- Get AI-powered responses and suggestions

### Code Generation
- Select text in any file
- Use `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to generate code
- The AI will analyze and provide improvements or explanations

### Toggle Features
- Use the Command Palette (`Ctrl+Shift+P`) and search for "IntelliPy"
- Toggle inline completions on/off
- Access all IntelliPy commands

## Configuration

Open VS Code settings and configure:

- `intellipy.enableInlineCompletions`: Enable/disable inline completions
- `intellipy.awsRegion`: AWS region for Bedrock service (default: us-east-1)
- `intellipy.modelId`: Bedrock model to use (default: Claude 3 Sonnet)

## Supported Models

- `anthropic.claude-3-sonnet-20240229-v1:0` (default)
- `anthropic.claude-3-haiku-20240307-v1:0`
- Other Claude 3 models available in your AWS region

## Requirements

- VS Code 1.80.0 or higher
- AWS account with Bedrock access
- AWS credentials configured
- Internet connection for API calls

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Ensure your AWS credentials have `bedrock:InvokeModel` permissions
2. **Model not available**: Check if the model is available in your AWS region
3. **No completions**: Verify AWS credentials are configured correctly

### Debug Steps

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify Bedrock access in AWS Console
3. Check VS Code Developer Console for error messages

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and feature requests, please create an issue in the repository.
