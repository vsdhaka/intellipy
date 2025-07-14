# 📋 IntelliPy Changelog

## v2.0.1 - 2025-01-13 (Latest)
### 🔧 Bug Fixes
- Fixed provider selection error "Cannot read properties of undefined (handleProviderSetup)"
- Corrected static method calls in CommandHandlers class

### 🏗️ Architecture
- Clean modular structure with 9 focused modules
- Main extension file reduced to 43 lines (from 1186 lines)
- Separated providers, features, and commands into logical modules

### 📦 Bundle
- Production bundle: 556.1kb (optimized)
- Total package: 2.12 MB

---

## v2.0.0 - 2025-01-13 
### 🎉 Major Refactoring
- **Complete architectural overhaul** from monolithic to modular design
- **Simplified M365 integration** - Removed complex Graph API, now browser-only
- **Provider standardization** - Clean factory pattern for provider management

### 🔄 Provider Changes
- **Simplified M365 Copilot**: Browser-only integration (no more complex auth)
- **AWS Bedrock**: Remains default provider with enhanced error handling
- **Custom Server**: Improved REST API support with validation

### 🗑️ Removed Features
- Microsoft Graph API integration (overly complex)
- MSAL authentication flows
- Device code authentication
- Azure app registration requirements

### 📁 New Structure
```
src/
├── extension.ts (43 lines) - Main entry point
├── providers/ - All AI provider implementations
└── features/ - Core features (chat, completions, commands)
```

### 📊 Metrics
- **97% reduction** in main file size (1186 → 43 lines)
- **80% reduction** in M365 complexity (400+ → 77 lines)
- **Removed dependencies**: @azure/msal-node
- **Simplified setup**: M365 now one-click browser opening

---

## v1.2.0 - 2025-01-12
### ✨ Provider Standardization
- Removed Google Gemini provider (as requested)
- Standardized 3-provider structure: Bedrock, M365, Custom
- Enhanced setup guidance for each provider
- Improved provider selection UI

### 🔧 Improvements
- Bedrock as default provider for reliability
- Custom provider with REST API support
- Better error handling and validation
- Provider-specific setup guidance

---

## v1.1.1 - 2025-01-12
### 🤖 M365 Copilot Enhanced Integration
- Advanced browser automation for M365 Copilot
- JavaScript injection for DOM manipulation
- Dual-mode automation (auto-script vs manual)
- CSS selector-based interaction patterns

### 📁 Bundle
- Production bundle: 477.5kb
- Enhanced M365 automation capabilities

---

## v1.1.0 - 2025-01-11
### 🌐 Microsoft 365 Copilot Integration
- Added M365 Copilot as AI provider option
- Microsoft Graph API integration framework
- MSAL Node authentication support
- Browser automation scripts for M365 interaction

### 🏗️ Architecture
- Multi-provider support infrastructure
- Provider factory pattern implementation
- Enhanced configuration system

---

## v1.0.1 - 2025-01-11
### 🔧 Bug Fixes
- Fixed command registration issues
- Resolved empty extension.ts file problems
- Improved error handling and logging

---

## v1.0.0 - 2025-01-10
### 🎉 Initial Release
- GitHub Copilot-like inline completions
- Interactive chat interface
- AWS Bedrock integration (Claude 3.5 Sonnet)
- Python-optimized code generation
- VS Code extension marketplace publication

### ✨ Core Features
- Real-time code completions
- Context-aware suggestions
- Privacy-first design with AWS Bedrock
- Beautiful chat webview interface
- Code generation from text selections

---

## 🎯 Key Milestones

### Architecture Evolution
- **v1.x**: Monolithic design, single provider focus
- **v2.0**: Modular architecture, multi-provider support
- **v2.0.1**: Production-ready with bug fixes

### Provider Journey
- **v1.0**: AWS Bedrock only
- **v1.1**: Added M365 Copilot (complex Graph API)
- **v1.2**: Added Custom provider, removed Gemini
- **v2.0**: Simplified M365 (browser-only), modular providers

### Code Quality
- **v1.x**: 1186-line monolith
- **v2.0**: 43-line main file, 9 focused modules
- **v2.0.1**: Production-stable modular architecture

## 🚀 What's Next

### Planned Features
- More AI provider integrations
- Enhanced inline completion context
- Advanced code analysis features
- Performance optimizations
- Unit testing framework

### Architecture Goals
- Maintain modular design
- Easy provider extensibility
- Performance optimization
- Enhanced user experience
