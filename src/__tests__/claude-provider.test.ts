import { ClaudeProvider } from "../providers/claude";
import Anthropic from "@anthropic-ai/sdk";

// Mock Anthropic SDK
const mockCreateMessage = jest.fn();
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreateMessage,
    },
  }));
});

// Mock fetch for embeddings
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("ClaudeProvider", () => {
  let provider: ClaudeProvider;
  const mockApiKey = "test-api-key";
  const mockModel = "claude-3-opus-20240229";

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new ClaudeProvider(mockApiKey, mockModel);
  });

  describe("chat", () => {
    it("should process chat messages correctly", async () => {
      const mockMessages = [
        { role: "system" as const, content: "You are a helpful assistant" },
        { role: "user" as const, content: "Hello!" },
      ];

      const mockResponse = {
        content: [
          {
            type: "text",
            text: "Hi there! How can I help you today?",
          },
        ],
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);

      const result = await provider.chat(mockMessages);

      expect(mockCreateMessage).toHaveBeenCalledWith({
        model: mockModel,
        system: "You are a helpful assistant",
        messages: [{ role: "user", content: "Hello!" }],
        max_tokens: 1024,
      });

      expect(result).toEqual({
        content: "Hi there! How can I help you today?",
        provider: "claude",
        model: mockModel,
      });
    });

    it("should handle non-text content", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];

      const mockResponse = {
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: "..." },
          },
        ],
      };

      mockCreateMessage.mockResolvedValueOnce(mockResponse);

      const result = await provider.chat(mockMessages);

      expect(result.content).toBe("");
    });

    it("should throw error when API call fails", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];

      const mockError = new Error("API Error");
      mockCreateMessage.mockRejectedValueOnce(mockError);

      await expect(provider.chat(mockMessages)).rejects.toThrow("API Error");
    });
  });

  describe("createEmbeddings", () => {
    it("should create embeddings correctly", async () => {
      const mockInput = "Hello, world!";
      const mockEmbedding = [0.1, 0.2, 0.3];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      });

      const result = await provider.createEmbeddings({ input: mockInput });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": mockApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-embedding-20240229",
            input: mockInput,
          }),
        }
      );

      expect(result).toEqual({
        embeddings: [mockEmbedding],
        provider: "claude",
        model: "claude-3-embedding-20240229",
      });
    });

    it("should handle embedding errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(
        provider.createEmbeddings({ input: "test" })
      ).rejects.toThrow("Claude API error: Bad Request");
    });
  });

  describe("unsupported features", () => {
    it.skip("should throw error for image generation", async () => {
      const generateImage = provider.generateImage?.bind(provider);
      await expect(() => generateImage?.()).rejects.toThrow(
        "Image generation is not supported by Claude"
      );
    });

    it("should throw error for assistants API methods", () => {
      const methods = {
        createAssistant: provider.createAssistant?.bind(provider),
        listAssistants: provider.listAssistants?.bind(provider),
        deleteAssistant: provider.deleteAssistant?.bind(provider),
        createThread: provider.createThread?.bind(provider),
        getThread: provider.getThread?.bind(provider),
        addMessage: provider.addMessage?.bind(provider),
        runAssistant: provider.runAssistant?.bind(provider),
        getAssistantResponse: provider.getAssistantResponse?.bind(provider),
      };

      Object.entries(methods).forEach(([name, method]) => {
        expect(() => method?.()).toThrow(
          "Assistants API is not supported by Claude"
        );
      });
    });
  });
});
