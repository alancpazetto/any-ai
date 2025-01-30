import OpenAI from "openai";
import {
  AIClient,
  ChatMessage,
  ChatResponse,
  ImageGenerationOptions,
  ImageGenerationResponse,
  EmbeddingOptions,
  EmbeddingResponse,
  Assistant,
  Thread,
  AssistantResponse,
} from "../types";

export class OpenAIProvider implements AIClient {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      return {
        content: response?.choices?.[0]?.message?.content || "",
        provider: "openai",
        model: this.model,
      };
    } catch (error) {
      throw error;
    }
  }

  async generateImage(
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResponse> {
    try {
      const response = await this.client.images.generate({
        prompt: options.prompt,
        n: options.n || 1,
        size:
          (options.size as "1024x1024" | "256x256" | "512x512") || "1024x1024",
        quality: (options.quality as "standard" | "hd") || "standard",
        style: (options.style as "natural" | "vivid") || "natural",
      });

      return {
        urls: response.data.map((image) => image.url ?? ""),
        provider: "openai",
      };
    } catch (error) {
      throw error;
    }
  }

  async createEmbeddings(
    options: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    try {
      const response = await this.client.embeddings.create({
        input: options.input,
        model: options.model || "text-embedding-ada-002",
      });

      return {
        embeddings: response.data.map((item) => item.embedding),
        provider: "openai",
        model: options.model || "text-embedding-ada-002",
      };
    } catch (error) {
      throw error;
    }
  }

  async createAssistant(
    name: string,
    options?: { model?: string; description?: string; instructions?: string }
  ): Promise<Assistant> {
    try {
      const response = await this.client.beta.assistants.create({
        name,
        model: options?.model || this.model,
        description: options?.description,
        instructions: options?.instructions,
      });

      return {
        id: response.id,
        name: response.name ?? "",
        description: response.description || undefined,
        model: response.model,
        instructions: response.instructions || undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async listAssistants(): Promise<Assistant[]> {
    try {
      const response = await this.client.beta.assistants.list();
      return response.data.map((assistant) => ({
        id: assistant.id,
        name: assistant.name ?? "",
        description: assistant.description || undefined,
        model: assistant.model,
        instructions: assistant.instructions || undefined,
      }));
    } catch (error) {
      throw error;
    }
  }

  async deleteAssistant(assistantId: string): Promise<boolean> {
    try {
      const response = await this.client.beta.assistants.del(assistantId);
      return response.deleted;
    } catch (error) {
      throw error;
    }
  }

  async createThread(): Promise<Thread> {
    try {
      const response = await this.client.beta.threads.create();
      return {
        id: response.id,
        messages: [],
      };
    } catch (error) {
      throw error;
    }
  }

  async getThread(threadId: string): Promise<Thread> {
    try {
      const messages = await this.client.beta.threads.messages.list(threadId);
      return {
        id: threadId,
        messages: messages.data.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: this.getMessageContent(msg),
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async addMessage(threadId: string, message: ChatMessage): Promise<void> {
    try {
      await this.client.beta.threads.messages.create(threadId, {
        role: message.role as "user" | "assistant",
        content: message.content,
      });
    } catch (error) {
      throw error;
    }
  }

  async runAssistant(
    assistantId: string,
    threadId: string
  ): Promise<AssistantResponse> {
    try {
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      return {
        messageId: run.id,
        threadId,
        content: "",
        status: this.mapRunStatus(run.status),
      };
    } catch (error) {
      throw error;
    }
  }

  async getAssistantResponse(
    threadId: string,
    runId: string
  ): Promise<AssistantResponse> {
    try {
      const run = await this.client.beta.threads.runs.retrieve(threadId, runId);
      const messages = await this.client.beta.threads.messages.list(threadId);

      const lastMessage = messages.data[0];
      return {
        messageId: lastMessage.id,
        threadId,
        content: this.getMessageContent(lastMessage),
        status: this.mapRunStatus(run.status),
      };
    } catch (error) {
      throw error;
    }
  }

  private mapRunStatus(status: string): "completed" | "in_progress" | "failed" {
    switch (status) {
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "in_progress";
    }
  }

  private getMessageContent(message: any): string {
    if (!message.content?.[0]) return "";
    const content = message.content[0];
    if (content.type === "text") {
      return content.text.value;
    }
    return "";
  }
}
