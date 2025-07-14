#!/bin/bash

echo "🚀 Testing IntelliPy AI Code Assistant"
echo "====================================="

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code is not installed or not in PATH"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "⚠️  AWS credentials not configured properly"
    echo "Please run: aws configure"
    echo "Or set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your_key"
    echo "  export AWS_SECRET_ACCESS_KEY=your_secret"
    echo "  export AWS_REGION=us-east-1"
    exit 1
fi

echo "✅ AWS credentials configured"

# Install the extension
echo "📦 Installing IntelliPy extension..."
code --install-extension intellipy-1.0.0.vsix --force

echo "✅ Extension installed successfully!"

# Create a test workspace
mkdir -p test-workspace
cd test-workspace

# Create a test Python file
cat > test_code.py << 'EOF'
# Test file for IntelliPy AI Code Assistant
def fibonacci(n):
    # Complete this function
    
class DataProcessor:
    # Add methods here
    
# Write a function to sort a list
EOF

# Create a test JavaScript file
cat > test_code.js << 'EOF'
// Test file for IntelliPy AI Code Assistant
function calculateSum(arr) {
    // Complete this function
}

class ApiClient {
    // Add methods here
}

// Write an async function to fetch data
EOF

echo "✅ Test workspace created with sample files"
echo ""
echo "🎯 How to test IntelliPy:"
echo ""
echo "1. Open VS Code in the test workspace:"
echo "   code test-workspace"
echo ""
echo "2. Test Inline Completions:"
echo "   - Open test_code.py or test_code.js"
echo "   - Start typing after the comments"
echo "   - You should see AI-powered suggestions"
echo ""
echo "3. Test Chat Interface:"
echo "   - Press Ctrl+Shift+I (Cmd+Shift+I on Mac)"
echo "   - Ask questions like: 'Explain this Python function'"
echo ""
echo "4. Test Code Generation:"
echo "   - Select some text in the file"
echo "   - Press Ctrl+Shift+B (Cmd+Shift+B on Mac)"
echo "   - AI will analyze and provide suggestions"
echo ""
echo "5. Access Commands via Command Palette:"
echo "   - Press Ctrl+Shift+P (Cmd+Shift+P on Mac)"
echo "   - Type 'IntelliPy' to see all available commands"
echo ""
echo "🔧 Configuration:"
echo "   - Open VS Code Settings"
echo "   - Search for 'intellipy'"
echo "   - Adjust settings as needed"
echo ""
echo "🌐 More info: https://intellipy.com"
echo "📖 Documentation: https://github.com/vsdhaka/intellipy"
echo ""
echo "Happy coding with AI assistance! 🤖"
