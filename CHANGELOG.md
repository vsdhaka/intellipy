# Changelog

All notable changes to IntelliPy will be documented in this file.

## [0.2.1] - 2024-01-13

### Added
- **Microsoft 365 Copilot Integration (Experimental)**
  - Direct API integration with Microsoft 365 Copilot
  - Automatic authentication using VS Code's Microsoft provider
  - Clear error messages when API is not available
  - Prepared for future Microsoft API availability

### Changed
- Updated documentation to clarify Microsoft 365 integration is experimental
- Removed fallback to built-in chat UI for cleaner implementation

## [0.2.0] - 2024-01-13

### 🎉 Major Release - Privacy First & Advanced Features

#### Added
- **Multi-mode Chat System**
  - Ask mode: Q&A about code
  - Edit mode: Direct code modifications
  - Agent mode: Autonomous multi-step tasks
- **Inline Chat** (Ctrl+I / Cmd+I)
  - Quick code edits without leaving editor
  - Context-aware suggestions
- **@ Mentions System**
  - `@file` - Reference specific files
  - `@workspace` - Include entire project context
  - `@symbol` - Reference functions/classes
- **Tool System with Safety**
  - File operations with confirmation prompts
  - "Allow Always" option for trusted operations
- **Privacy Enhancements**
  - Removed all CDN dependencies
  - Bundled all resources locally
  - Added Content Security Policy
  - Comprehensive privacy documentation

#### Changed
- Updated UI with mode selection buttons
- Enhanced chat interface with better styling
- Improved error handling and user feedback
- Better documentation emphasizing privacy

#### Security
- All external resources now bundled locally
- No telemetry or analytics
- Transparent data flow documentation

## [0.1.1] - 2024-01-13

### Added
- Initial marketplace release
- Support for AWS Bedrock, Google Gemini, and custom servers
- Basic chat interface
- Code analysis and context gathering
- Syntax highlighting in chat

## [0.1.0] - 2024-01-13

### Added
- Initial release
- Basic Python code analysis
- LLM integration framework