# LLM Provider Configuration Guide

## Quick Setup Examples

### AWS Bedrock (Recommended for Claude)
```json
{
  "intellipy.llmProvider": "bedrock",
  "intellipy.awsRegion": "us-east-1",
  "intellipy.modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0"
}
```

### Google Gemini
```json
{
  "intellipy.llmProvider": "gemini",
  "intellipy.geminiApiKey": "YOUR_API_KEY",
  "intellipy.geminiModel": "gemini-pro"
}
```

### Local Models with Ollama
```bash
# First, install and run Ollama
ollama run codellama
```

```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customEndpoint": "http://localhost:11434/api/generate",
  "intellipy.customModel": "codellama",
  "intellipy.customFormat": "ollama"
}
```

### Local Models with llama.cpp
```bash
# Run llama.cpp server
./server -m models/codellama-7b.gguf -c 4096 --port 8080
```

```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customEndpoint": "http://localhost:8080/v1/chat/completions",
  "intellipy.customModel": "codellama-7b",
  "intellipy.customFormat": "openai"
}
```

## Custom Server Options

### Format Types

1. **openai** - OpenAI-compatible format
   - Works with: llama.cpp, vLLM, FastChat, text-generation-webui
   - Endpoint usually ends with `/v1/chat/completions`

2. **ollama** - Native Ollama format
   - Works with: Ollama
   - Endpoints: `/api/generate` or `/api/chat`

3. **raw** - Simple prompt/response
   - Works with: Custom implementations
   - Sends: `{ "prompt": "..." }`
   - Expects: `{ "response": "..." }` or similar

### Internal Company Server Example

If your company runs an internal LLM server:

```json
{
  "intellipy.llmProvider": "custom",
  "intellipy.customEndpoint": "https://llm.internal.company.com/v1/chat/completions",
  "intellipy.customApiKey": "internal-api-key-12345",
  "intellipy.customModel": "company-python-model-v2",
  "intellipy.customFormat": "openai"
}
```

## Testing Your Configuration

1. Open a Python file
2. Open the AI Assistant panel
3. Type: "Hello, can you see my code?"
4. The assistant should respond with context about your file

## Troubleshooting

### AWS Bedrock
- Ensure AWS credentials are configured
- Check model availability in your region
- Verify IAM permissions for Bedrock

### Gemini
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check API quotas and limits

### Custom/Local
- Verify server is running: `curl http://localhost:11434/api/tags`
- Check firewall/network settings
- Ensure model is loaded in server

### Common Issues

1. **Connection refused**: Server not running or wrong port
2. **401/403 errors**: Check API key or credentials
3. **Model not found**: Verify model name matches server's model list
4. **Empty responses**: Check response format matches expected structure