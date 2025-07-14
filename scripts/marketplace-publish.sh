#!/bin/bash

echo "🚀 Publishing IntelliPy to VS Code Marketplace"
echo "=============================================="

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "📋 Checking prerequisites..."

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "⚠️  vsce not found. Installing..."
    npm install -g vsce
fi

# Check if logged in to marketplace
echo "🔐 Checking marketplace authentication..."
if ! vsce ls-publishers &> /dev/null; then
    echo "❌ Not logged in to VS Code Marketplace"
    echo "Please login first with: vsce login intellipy-dev"
    echo "You'll need your Personal Access Token from:"
    echo "https://dev.azure.com/intellipy-dev/_usersSettings/tokens"
    exit 1
fi

echo "✅ Prerequisites check passed"

echo "🔨 Building extension..."
npm run esbuild-prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "📦 Packaging extension..."
vsce package

if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi

echo "🌐 Publishing to marketplace..."
vsce publish

if [ $? -eq 0 ]; then
    echo "✅ Successfully published IntelliPy to VS Code Marketplace!"
    echo "🎉 Your extension will be available at:"
    echo "   https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Wait 5-10 minutes for the extension to be indexed"
    echo "   2. Test installation: code --install-extension intellipy-dev.intellipy"
    echo "   3. Update your website with the marketplace link"
else
    echo "❌ Publishing failed"
    echo "Please check the error messages above"
    exit 1
fi
