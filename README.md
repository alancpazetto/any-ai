# @alancpazetto/any-ai

A TypeScript library that provides a unified interface for multiple AI chat providers (OpenAI, Gemini).

## Installation

```bash
npm install @alancpazetto/any-ai
```

## Usage

### Chat Completion

```typescript
import { AnyChat } from '@alancpazetto/any-ai';

// Create an OpenAI client
const openaiClient = AnyChat.createClient({
  provider: 'openai',
  apiKey: 'your-openai-api-key',
  model: 'gpt-3.5-turbo' // optional, defaults to gpt-3.5-turbo
});

// Create a Gemini client
const geminiClient = AnyChat.createClient({
  provider: 'gemini',
  apiKey: 'your-gemini-api-key',
  model: 'gemini-pro' // optional, defaults to gemini-pro
});

// Use the same interface for both providers
async function chat() {
  const messages = [
    { role: 'user', content: 'Hello! How are you?' }
  ];

  // Using OpenAI
  const openaiResponse = await openaiClient.chat(messages);
  console.log('OpenAI response:', openaiResponse.content);

  // Using Gemini
  const geminiResponse = await geminiClient.chat(messages);
  console.log('Gemini response:', geminiResponse.content);
}
```

### Image Generation (OpenAI only)

```typescript
const response = await openaiClient.generateImage({
  prompt: 'A beautiful sunset over mountains',
  n: 1, // number of images to generate
  size: '1024x1024', // '256x256', '512x512', or '1024x1024'
  quality: 'standard', // 'standard' or 'hd'
  style: 'natural' // 'natural' or 'vivid'
});

console.log('Generated image URLs:', response.urls);
```

### Embeddings

```typescript
// Generate embeddings for text
const embeddings = await client.createEmbeddings({
  input: 'Hello, world!',
  model: 'text-embedding-ada-002' // optional for OpenAI
});

console.log('Text embeddings:', embeddings.embeddings);
```

### Assistants API (OpenAI only)

```typescript
// Create an assistant
const assistant = await openaiClient.createAssistant('My Assistant', {
  model: 'gpt-4',
  description: 'A helpful assistant',
  instructions: 'You are a helpful assistant.'
});

// Create a thread
const thread = await openaiClient.createThread();

// Add a message to the thread
await openaiClient.addMessage(thread.id, {
  role: 'user',
  content: 'Hello! Can you help me?'
});

// Run the assistant
const run = await openaiClient.runAssistant(assistant.id, thread.id);

// Get the assistant's response
const response = await openaiClient.getAssistantResponse(thread.id, run.messageId);
console.log('Assistant response:', response.content);
```

## Features

- Unified interface for multiple AI providers
- Type-safe API
- Easy to switch between providers
- Support for:
  - Chat completions
  - Image generation (OpenAI)
  - Embeddings
  - Assistants API (OpenAI)
- Extensible design for adding more providers

## API Reference

### AnyChat.createClient(config)

Creates a new AI client based on the provided configuration.

#### Config Options

- `provider`: 'openai' | 'gemini'
- `apiKey`: Your API key for the selected provider
- `model`: (optional) The model to use for the selected provider

### Client Methods

#### chat(messages)
Send a chat message to the AI provider.
- Parameters: Array of message objects with `role` and `content`
- Returns: Promise<ChatResponse>

#### generateImage(options) [OpenAI only]
Generate images from a text prompt.
- Parameters: ImageGenerationOptions
- Returns: Promise<ImageGenerationResponse>

#### createEmbeddings(options)
Generate embeddings for text input.
- Parameters: EmbeddingOptions
- Returns: Promise<EmbeddingResponse>

#### Assistants API Methods [OpenAI only]
- createAssistant(name, options)
- listAssistants()
- deleteAssistant(assistantId)
- createThread()
- getThread(threadId)
- addMessage(threadId, message)
- runAssistant(assistantId, threadId)
- getAssistantResponse(threadId, messageId)

## Provider Support Matrix

| Feature          | OpenAI | Gemini |
| ---------------- | ------ | ------ |
| Chat             | ✅      | ✅      |
| Image Generation | ✅      | ❌      |
| Embeddings       | ✅      | ✅      |
| Assistants API   | ✅      | ❌      |

## License

MIT 