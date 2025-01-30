import {
  AIClient,
  ChatMessage,
  ChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
} from "../types";

export class DeepSeekProvider implements AIClient {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(
    apiKey: string,
    model: string = "deepseek-chat",
    baseURL: string = "https://api.deepseek.com/v1"
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = baseURL;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        provider: "deepseek",
        model: this.model,
      };
    } catch (error) {
      throw error;
    }
  }

  async createEmbeddings(
    options: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    try {
      const inputs = Array.isArray(options.input)
        ? options.input
        : [options.input];
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || "deepseek-embedding",
          input: inputs,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        embeddings: data.data.map(
          (item: { embedding: number[] }) => item.embedding
        ),
        provider: "deepseek",
        model: options.model || "deepseek-embedding",
      };
    } catch (error) {
      throw error;
    }
  }

  // Note: DeepSeek doesn't support image generation yet
  async generateImage(): Promise<never> {
    return Promise.reject(
      new Error("Image generation is not supported by DeepSeek")
    );
  }

  // Note: DeepSeek doesn't support Assistants API
  createAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  listAssistants?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  deleteAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  createThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  getThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  addMessage?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  runAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }

  getAssistantResponse?(): Promise<never> {
    throw new Error("Assistants API is not supported by DeepSeek");
  }
}
