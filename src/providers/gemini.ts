import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import {
  AIClient,
  ChatMessage,
  ChatResponse,
  ImageGenerationOptions,
  ImageGenerationResponse,
  EmbeddingOptions,
  EmbeddingResponse,
} from "../types";

export class GeminiProvider implements AIClient {
  private client: GoogleGenerativeAI;
  private model: string;
  private generativeModel: GenerativeModel;

  constructor(apiKey: string, model: string = "gemini-pro") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
    this.generativeModel = this.client.getGenerativeModel({
      model: this.model,
    });
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const chat = this.generativeModel.startChat();

    for (const message of messages) {
      if (message.role === "user") {
        await chat.sendMessage(message.content);
      }
    }

    const lastUserMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastUserMessage.content);
    const response = await result.response;

    return {
      content: response.text(),
      provider: "gemini",
      model: this.model,
    };
  }

  // Note: Gemini's image generation capabilities are different from OpenAI's.
  // This is a placeholder for when Gemini adds proper image generation support
  async generateImage(
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResponse> {
    throw new Error("Image generation is not yet supported by Gemini");
  }

  async createEmbeddings(
    options: EmbeddingOptions
  ): Promise<EmbeddingResponse> {
    try {
      const model = this.client.getGenerativeModel({ model: "embedding-001" });
      const input = Array.isArray(options.input)
        ? options.input[0]
        : options.input;
      const result = await model.embedContent(input);

      // Convert the embedding to a regular array
      const embeddingArray = Object.values(result.embedding);

      return {
        embeddings: [embeddingArray],
        provider: "gemini",
        model: "embedding-001",
      };
    } catch (error) {
      throw error;
    }
  }

  // Note: Gemini doesn't support Assistants API yet
  createAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  listAssistants?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  deleteAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  createThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  getThread?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  addMessage?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  runAssistant?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }

  getAssistantResponse?(): Promise<never> {
    throw new Error("Assistants API is not supported by Gemini");
  }
}
