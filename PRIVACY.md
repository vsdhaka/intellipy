# IntelliPy Privacy & Setup Guide

## Privacy First Commitment

IntelliPy is designed with privacy as the top priority:

- **No telemetry or analytics** - We don't collect any usage data
- **No external dependencies** - All resources are bundled locally
- **No hidden connections** - Only connects to your configured LLM provider
- **Your data stays yours** - Code is only sent to the LLM provider you explicitly configure
- **Transparent operations** - All network requests are visible in your configuration

## Data Flow Transparency

IntelliPy only communicates with:
1. **Your configured LLM provider** (AWS Bedrock, Google Gemini, Microsoft 365 Copilot, or custom server)
2. **No other external services**

Your code and queries are sent ONLY to the LLM provider you have explicitly configured in settings.

## Quick Setup Guide

### 1. AWS Bedrock Setup

For enterprise users with AWS accounts:

```json
{
  "intellipy.llmProvider": "bedrock",
  "intellipy.bedrock.region": "us-east-1",
  "intellipy.bedrock.modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0"
}
```

**AWS Authentication Options:**

1. **Using AWS CLI** (Recommended):
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region
   ```

2. **Using Environment Variables**:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

3. **Using AWS SSO** (For enterprise users):
   ```bash
   aws sso login --profile your-profile
   export AWS_PROFILE=your-profile
   ```

   Learn more: https://docs.aws.amazon.com/signin/latest/userguide/sign-in-urls-defined.html

### 2. Google Gemini Setup

For users with Google Cloud accounts:

```json
{
  "intellipy.llmProvider": "gemini",
  "intellipy.gemini.apiKey": "your-api-key-here",
  "intellipy.gemini.model": "gemini-1.5-flash"
}
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Microsoft 365 Copilot Setup (Experimental)

For enterprise users with Microsoft 365 subscriptions:

```json
{
  "intellipy.llmProvider": "microsoft365"
}
```

**Important Notes**:
- This is an experimental feature as Microsoft has not yet released public APIs for Copilot
- Authentication uses VS Code's built-in Microsoft provider
- Requires a valid Microsoft 365 Copilot license
- Will show clear error messages if the API is not available

**Current Status**:
- Microsoft 365 Copilot API access is not yet publicly available
- This integration is prepared for when Microsoft enables API access
- Use AWS Bedrock, Google Gemini, or local models in the meantime

### 4. Local/Custom Server Setup

For maximum privacy with local models:

```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customServer.endpoint": "http://localhost:11434/api/chat",
  "intellipy.customServer.apiKey": "optional-key",
  "intellipy.customServer.model": "codellama",
  "intellipy.customServer.format": "Ollama format"
}
```

**Supported Local Servers:**
- **Ollama**: `http://localhost:11434/api/chat`
- **llama.cpp**: `http://localhost:8080/v1/chat/completions`
- **LocalAI**: `http://localhost:8080/v1/chat/completions`
- **Corporate servers**: Your internal LLM endpoint

## Security Best Practices

1. **API Key Management**:
   - Never commit API keys to version control
   - Use environment variables or AWS credentials
   - Rotate keys regularly

2. **Network Security**:
   - Use HTTPS endpoints when possible
   - Configure firewall rules for local models
   - Use VPN for corporate endpoints

3. **Code Security**:
   - Review code before sending to LLM
   - Be cautious with sensitive code
   - Use local models for highly sensitive projects

## Verification

To verify IntelliPy's privacy:

1. **Check network requests** in VS Code:
   - Open Developer Tools: `Help > Toggle Developer Tools`
   - Go to Network tab
   - All requests should only go to your configured LLM endpoint

2. **Review the source code**:
   - GitHub: https://github.com/vsdhaka/intellipy
   - All network calls are in `src/llmService.ts`

## Troubleshooting

### AWS Bedrock Issues

1. **Authentication Error**:
   ```
   Error: Could not load credentials from any providers
   ```
   Solution: Run `aws configure` or set AWS environment variables

2. **Region Error**:
   ```
   Error: Model not available in region
   ```
   Solution: Check model availability in your region:
   https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html

### Local Server Issues

1. **Connection Refused**:
   ```
   Error: ECONNREFUSED
   ```
   Solution: Ensure your local LLM server is running

2. **Timeout Error**:
   Solution: Increase timeout in settings or use a smaller model

## Support

- Issues: https://github.com/vsdhaka/intellipy/issues
- Documentation: https://intellipy.com

Remember: Your privacy is our priority. IntelliPy will never send your data anywhere except the LLM provider you explicitly configure.