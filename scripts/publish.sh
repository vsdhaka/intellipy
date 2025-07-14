#!/bin/bash

echo "🚀 IntelliPy Extension Publishing Script"
echo "======================================="

# Check if icon.png exists
if [ ! -f "icon.png" ]; then
    echo "❌ icon.png not found in root directory"
    echo "Please add the AI assistant icon as icon.png (128x128 pixels)"
    exit 1
fi

echo "✅ Icon found"

# Check if we're logged in to vsce
if ! vsce ls-publishers 2>/dev/null | grep -q "intellipy-dev"; then
    echo "🔐 Please login to your publisher account:"
    vsce login intellipy-dev
fi

# Build the extension
echo "🔨 Building extension..."
npm run esbuild-prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Package the extension
echo "📦 Packaging extension..."
vsce package

if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi

echo "✅ Extension packaged successfully!"

# Ask if user wants to publish
read -p "Do you want to publish to VS Code Marketplace? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Publishing to VS Code Marketplace..."
    vsce publish
    
    if [ $? -eq 0 ]; then
        echo "🎉 Extension published successfully!"
        echo "📝 Your extension will be available at:"
        echo "   https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy"
    else
        echo "❌ Publishing failed"
        exit 1
    fi
else
    echo "📦 Extension packaged but not published"
    echo "Run 'vsce publish' when ready to publish"
fi

echo ""
echo "📋 Next steps:"
echo "1. Test the extension locally: code --install-extension intellipy-1.0.0.vsix"
echo "2. Update your website at https://intellipy.com"
echo "3. Share the marketplace link with users"
