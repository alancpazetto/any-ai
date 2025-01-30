import { GeminiProvider } from "../providers/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe("GeminiProvider", () => {
  let provider: GeminiProvider;
  const mockApiKey = "test-api-key";
  const mockModel = "gemini-pro";

  const mockGenerativeModel = {
    startChat: jest.fn(),
    embedContent: jest.fn(),
  };

  const mockChat = {
    sendMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (
      GoogleGenerativeAI.prototype.getGenerativeModel as jest.Mock
    ).mockReturnValue(mockGenerativeModel);
    mockGenerativeModel.startChat.mockReturnValue(mockChat);
    provider = new GeminiProvider(mockApiKey, mockModel);
  });

  describe("chat", () => {
    it("should process chat messages correctly", async () => {
      const mockMessages = [
        { role: "user" as const, content: "Hello!" },
        { role: "assistant" as const, content: "Hi there!" },
        { role: "user" as const, content: "How are you?" },
      ];

      const mockResponse = {
        response: {
          text: () => "I am doing well, thank you!",
        },
      };

      mockChat.sendMessage.mockResolvedValue(mockResponse);

      const result = await provider.chat(mockMessages);

      // Should send all user messages
      expect(mockChat.sendMessage).toHaveBeenCalledTimes(3);
      expect(mockChat.sendMessage).toHaveBeenLastCalledWith("How are you?");

      expect(result).toEqual({
        content: "I am doing well, thank you!",
        provider: "gemini",
        model: mockModel,
      });
    });

    it("should handle empty message array", async () => {
      const mockMessages: any[] = [];
      await expect(provider.chat(mockMessages)).rejects.toThrow();
    });

    it("should throw error when API call fails", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];
      const mockError = new Error("API Error");
      mockChat.sendMessage.mockRejectedValue(mockError);
      await expect(provider.chat(mockMessages)).rejects.toThrow("API Error");
    });
  });

  describe("createEmbeddings", () => {
    it("should create embeddings correctly for single input", async () => {
      const mockInput = "Hello, world!";
      const mockEmbedding = {
        embedding: [0.1, 0.2, 0.3],
      };

      mockGenerativeModel.embedContent.mockResolvedValueOnce(mockEmbedding);

      const result = await provider.createEmbeddings({ input: mockInput });

      expect(mockGenerativeModel.embedContent).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual({
        embeddings: [[0.1, 0.2, 0.3]],
        provider: "gemini",
        model: "embedding-001",
      });
    });

    it("should create embeddings correctly for array input", async () => {
      const mockInput = ["Hello", "world"];
      const mockEmbedding = {
        embedding: [0.1, 0.2, 0.3],
      };

      mockGenerativeModel.embedContent.mockResolvedValueOnce(mockEmbedding);

      const result = await provider.createEmbeddings({ input: mockInput });

      expect(mockGenerativeModel.embedContent).toHaveBeenCalledWith(
        mockInput[0]
      );
      expect(result).toEqual({
        embeddings: [[0.1, 0.2, 0.3]],
        provider: "gemini",
        model: "embedding-001",
      });
    });

    it("should handle embedding errors", async () => {
      const mockError = new Error("Embedding Error");
      mockGenerativeModel.embedContent.mockRejectedValueOnce(mockError);
      await expect(
        provider.createEmbeddings({ input: "test" })
      ).rejects.toThrow("Embedding Error");
    });
  });

  describe("unsupported features", () => {
    it("should throw error for generateImage", async () => {
      await expect(provider.generateImage({ prompt: "test" })).rejects.toThrow(
        "Image generation is not yet supported by Gemini"
      );
    });

    it("should throw error for assistants API methods", () => {
      expect(provider.createAssistant).toBeDefined();
      expect(provider.listAssistants).toBeDefined();
      expect(provider.deleteAssistant).toBeDefined();
      expect(provider.createThread).toBeDefined();
      expect(provider.getThread).toBeDefined();
      expect(provider.addMessage).toBeDefined();
      expect(provider.runAssistant).toBeDefined();
      expect(provider.getAssistantResponse).toBeDefined();

      expect(() => provider.createAssistant?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.listAssistants?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.deleteAssistant?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.createThread?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.getThread?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.addMessage?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.runAssistant?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
      expect(() => provider.getAssistantResponse?.()).toThrow(
        "Assistants API is not supported by Gemini"
      );
    });
  });
});
