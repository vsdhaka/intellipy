# IntelliPy VS Code Marketplace Publication Checklist

## ✅ Pre-Publication Checklist

### Extension Configuration
- [x] **Publisher ID**: Set to `intellipy-dev` in package.json
- [x] **Extension Name**: `intellipy` 
- [x] **Display Name**: "IntelliPy - AI Code Assistant"
- [x] **Version**: 1.0.0
- [x] **Icon**: icon.png (128x128 pixels)
- [x] **License**: MIT License included
- [x] **Repository**: https://github.com/vsdhaka/intellipy.git
- [x] **Homepage**: https://intellipy.com

### Required Files
- [x] **package.json**: Properly configured
- [x] **README.md**: Comprehensive documentation
- [x] **LICENSE**: MIT license file
- [x] **icon.png**: Extension icon in root directory
- [x] **.vscodeignore**: Optimized file exclusions

### Extension Features
- [x] **Inline Completions**: Real-time AI suggestions
- [x] **Chat Interface**: Interactive AI assistant
- [x] **Code Generation**: From text selection
- [x] **AWS Bedrock Integration**: Privacy-first AI
- [x] **Keyboard Shortcuts**: Ctrl+Shift+I, Ctrl+Shift+B
- [x] **Configuration**: User settings for customization

## 🚀 Publication Steps

### 1. Install VSCE (if not already installed)
```bash
npm install -g vsce
```

### 2. Login to Marketplace
```bash
vsce login intellipy-dev
```
**Note**: You'll need a Personal Access Token from Azure DevOps:
https://dev.azure.com/intellipy-dev/_usersSettings/tokens

### 3. Publish Extension
```bash
./marketplace-publish.sh
```

Or manually:
```bash
vsce publish
```

## 📋 Post-Publication

### Immediate (0-10 minutes)
- [ ] Verify extension appears in marketplace
- [ ] Test installation: `code --install-extension intellipy-dev.intellipy`
- [ ] Check extension page: https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy

### Within 24 hours
- [ ] Update website with marketplace link
- [ ] Test all features work correctly
- [ ] Monitor for any user feedback or issues
- [ ] Update GitHub repository with marketplace badge

## 🔗 Important Links

- **Marketplace Page**: https://marketplace.visualstudio.com/items?itemName=intellipy-dev.intellipy
- **Publisher Dashboard**: https://marketplace.visualstudio.com/manage/publishers/intellipy-dev
- **GitHub Repository**: https://github.com/vsdhaka/intellipy
- **Homepage**: https://intellipy.com
- **Documentation**: https://intellipy.pages.dev

## 🛠️ Marketplace Commands

```bash
# Login to marketplace
vsce login intellipy-dev

# Package extension
vsce package

# Publish extension
vsce publish

# Update existing extension
vsce publish [version]

# Unpublish extension (if needed)
vsce unpublish intellipy-dev.intellipy
```

## 📊 Marketplace Metrics

After publication, monitor:
- Download counts
- User ratings and reviews
- Installation success rates
- Feature usage analytics (if implemented)

## 🔄 Future Updates

To update the extension:
1. Update version in package.json
2. Build and test changes
3. Run `vsce publish` to publish update
4. Update documentation as needed
