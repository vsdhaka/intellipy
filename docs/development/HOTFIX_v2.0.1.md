# 🔧 Hotfix v2.0.1 - Provider Selection Error

## Issue Fixed
**Error**: "Cannot read properties of undefined (handleProviderSetup)"
**Cause**: Incorrect method call in static context

## Root Cause
In the `CommandHandlers.selectProvider()` static method, we were calling:
```typescript
await this.handleProviderSetup(selected.value); // ❌ Wrong - 'this' is undefined in static context
```

## Solution
Fixed to use class name for static method calls:
```typescript
await CommandHandlers.handleProviderSetup(selected.value); // ✅ Correct
```

## Technical Details
- **File**: `src/features/commands.ts`
- **Method**: `CommandHandlers.selectProvider()`
- **Issue**: Static method trying to call another static method using `this`
- **Fix**: Use class name `CommandHandlers` instead of `this`

## Impact
- **Bedrock provider selection**: Now works correctly
- **M365 provider selection**: Now works correctly  
- **Custom provider selection**: Now works correctly
- **All provider setup flows**: Now functional

## Version
- **Fixed in**: v2.0.1
- **Build size**: 556.1kb (unchanged)
- **Status**: ✅ Ready for use

## Testing
1. Open VS Code
2. Run "IntelliPy: Select AI Provider"
3. Select any provider (Bedrock, M365, Custom)
4. Verify setup guidance appears without errors

The provider selection now works correctly for all three providers! 🎉
