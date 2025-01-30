import Anthropic from "@anthropic-ai/sdk";
import {
  AIClient,
  ChatMessage,
  ChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
} from "../types";

export class ClaudeProvider implements AIClient {
  private client: Anthropic;
  private model: string;
  private apiKey: string;

  constructor(apiKey: string, model: string = "claude-3-opus-20240229") {
    this.client = new Anthropic({
      apiKey,
    });
    this.model = model;
    this.apiKey = apiKey;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      // Convert messages to Claude format
      const systemMessage = messages.find((msg) => msg.role === "system");
      const userMessages = messages.filter(
        (msg) => msg.role === "user" || msg.role === "assistant"
      );

      const response = await this.client.messages.create({
        model: this.model,
        system: systemMessage?.content,
        messages: userMessages.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        max_tokens: 1024,
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      return {
        content,
        provider: "claude",
        model: this.model,
      };
    } catch (error) {
      throw error;
    }
  }

  // Note: Claude's embedding API is not yet available in the SDK
  async createEmbeddings(
    options: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    try {
      const inputs = Array.isArray(options.input)
        ? options.input
        : [options.input];
      const model = options.model || "claude-3-embedding-20240229";

      // Use fetch directly since SDK doesn't support embeddings yet
      const response = await fetch("https://api.anthropic.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          input: inputs[0], // Claude currently supports only single input
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        embeddings: [data.embedding],
        provider: "claude",
        model,
      };
    } catch (error) {
      throw error;
    }
  }

  // Note: Claude doesn't support image generation
  generateImage?(): Promise<never> {
    throw new Error("Image generation is not supported by Claude");
  }

  // Note: Claude doesn't support Assistants API
  createAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  listAssistants?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  deleteAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  createThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  getThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  addMessage?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  runAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }

  getAssistantResponse?(): Promise<never> {
    throw new Error("Assistants API is not supported by Claude");
  }
}
