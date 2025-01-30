export type AIProvider = "openai" | "gemini" | "claude" | "deepseek";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseURL?: string; // For DeepSeek custom endpoint
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  content: string;
  provider: AIProvider;
  model: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
}

export interface ImageGenerationResponse {
  urls: string[];
  provider: AIProvider;
}

export interface EmbeddingOptions {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  provider: AIProvider;
  model: string;
}

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  model: string;
  instructions?: string;
}

export interface Thread {
  id: string;
  messages: ChatMessage[];
}

export interface AssistantResponse {
  messageId: string;
  threadId: string;
  content: string;
  status: "completed" | "in_progress" | "failed";
}

export interface AIClient {
  // Chat completion
  chat(messages: ChatMessage[]): Promise<ChatResponse>;

  // Image generation
  generateImage?(
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResponse>;

  // Embeddings
  createEmbeddings?(options: EmbeddingOptions): Promise<EmbeddingResponse>;

  // Assistants API
  createAssistant?(
    name: string,
    options?: { model?: string; description?: string; instructions?: string }
  ): Promise<Assistant>;
  listAssistants?(): Promise<Assistant[]>;
  deleteAssistant?(assistantId: string): Promise<boolean>;

  // Thread management
  createThread?(): Promise<Thread>;
  getThread?(threadId: string): Promise<Thread>;
  addMessage?(threadId: string, message: ChatMessage): Promise<void>;

  // Run assistant
  runAssistant?(
    assistantId: string,
    threadId: string
  ): Promise<AssistantResponse>;
  getAssistantResponse?(
    threadId: string,
    messageId: string
  ): Promise<AssistantResponse>;
}
