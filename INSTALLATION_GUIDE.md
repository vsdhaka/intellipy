# IntelliPy - Installation & Usage Guide

## Prerequisites

1. **VS Code** installed (version 1.74.0 or higher)
2. **Node.js** installed (version 16+ recommended)
3. **AWS Account** with Bedrock access (if using Bedrock)
4. **AWS Credentials** configured on your machine

## Installation Methods

### Method 1: Development Mode (Recommended for Testing)

1. **Clone and Build**
   ```bash
   cd python-ai-assistant
   npm install
   npm run compile
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Launch Extension**
   - Press `F5` in VS Code
   - A new VS Code window will open with the extension loaded
   - You'll see "[Extension Development Host]" in the title

### Method 2: Package and Install

1. **Package the Extension**
   ```bash
   npm run package
   ```
   This creates a `.vsix` file in the project directory.

2. **Install in VS Code**
   - Open VS Code
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Extensions: Install from VSIX..."
   - Select the generated `.vsix` file

## Configuration

### 1. Configure AWS Credentials

Make sure you have AWS credentials configured:

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Option 3: AWS credentials file (~/.aws/credentials)
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
region = us-east-1
```

### 2. Configure Extension Settings

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "IntelliPy"
3. Configure:
   - **LLM Provider**: Select "bedrock"
   - **AWS Region**: Your AWS region (e.g., "us-east-1")
   - **Model ID**: Select from dropdown (e.g., "Claude 3.5 Sonnet")
   - **Max Context Files**: Number of files to include (default: 10)

Or add to `settings.json`:
```json
{
  "intellipy.llmProvider": "bedrock",
  "intellipy.awsRegion": "us-east-1",
  "intellipy.modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "intellipy.maxContextFiles": 10
}
```

## Using the Extension

### 1. Access the AI Assistant

The extension appears in two places:

**A. Activity Bar (Sidebar)**
- Look for the robot icon (🤖) in the left sidebar
- Click it to open the IntelliPy panel
- The chat interface will appear

**B. Command Palette**
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
- Type "AI: Open Chat" or "AI: Analyze Python Code"

### 2. Analyze Code

**Method 1: Via Chat Interface**
1. Open a Python file in the editor
2. Click the robot icon in the sidebar
3. Click "Analyze Current File" button
4. The AI will analyze your code and related files

**Method 2: Via Command**
1. Open a Python file
2. Press `Ctrl+Shift+P`
3. Run "AI: Analyze Python Code"

### 3. Chat with AI

1. Open the chat panel (robot icon in sidebar)
2. Type your question in the text area
3. Press Enter or click Send
4. The AI will respond with context from your codebase

## Features in Action

### What Happens When You Analyze Code:

1. **File Discovery**
   - Reads your current Python file
   - Finds imported modules
   - Locates related files (tests, same directory)
   - Limits to 10 files by default

2. **Context Building**
   - Consolidates all relevant code
   - Formats it for the AI model
   - Includes file paths for reference

3. **AI Analysis**
   - Sends consolidated code to Claude
   - Receives suggestions and insights
   - Displays in the chat interface

### Example Workflow:

1. Open `main.py` in your Python project
2. Click the robot icon in the sidebar
3. Ask: "What does this function do and how can I improve it?"
4. The AI analyzes `main.py` and related files
5. Provides detailed explanation and suggestions

## Troubleshooting

### Extension Not Appearing?

1. Check the Output panel (`View > Output`)
2. Select "Extension Host" from dropdown
3. Look for error messages

### AWS Errors?

1. **Access Denied**: Check AWS credentials and Bedrock permissions
2. **Model Not Found**: Ensure the model is available in your region
3. **Rate Limit**: Wait and retry, or use a different model

### Common Issues:

- **No sidebar icon**: Restart VS Code after installation
- **Chat not responding**: Check AWS credentials configuration
- **Files not found**: Ensure you have a Python file open

## Visual Guide

```
VS Code Window Layout:
┌─────────────────────────────────────────┐
│ File  Edit  View  ...                   │
├─────┬───────────────────────────────────┤
│  📁 │  main.py                          │
│  🔍 │  def calculate_total():           │
│  📝 │      # Your Python code here      │
│ ►🤖 │                                   │ ← Click robot icon
│  🔧 │                                   │
│  📦 │                                   │
├─────┴───────────────────────────────────┤
│ Terminal    Problems    Output    ...   │
└─────────────────────────────────────────┘

After clicking robot icon:
┌─────────────────────────────────────────┐
│ IntelliPy                     │
├─────────────────────────────────────────┤
│ [Analyze Current File]                  │
├─────────────────────────────────────────┤
│ Chat messages appear here...            │
│                                         │
│ User: How can I optimize this?         │
│                                         │
│ Assistant: Based on your code...        │
│                                         │
├─────────────────────────────────────────┤
│ [Type your message...          ] [Send] │
└─────────────────────────────────────────┘
```

## Next Steps

1. Test with a Python project
2. Adjust settings for your needs
3. Report issues or suggest features
4. Consider contributing to the project!