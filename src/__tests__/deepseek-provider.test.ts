import { DeepSeekProvider } from "../providers/deepseek";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("DeepSeekProvider", () => {
  let provider: DeepSeekProvider;
  const mockApiKey = "test-api-key";
  const mockModel = "deepseek-chat";
  const mockBaseURL = "https://api.deepseek.com/v1";

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new DeepSeekProvider(mockApiKey, mockModel, mockBaseURL);
  });

  describe("chat", () => {
    it("should process chat messages correctly", async () => {
      const mockMessages = [
        { role: "system" as const, content: "You are a helpful assistant" },
        { role: "user" as const, content: "Hello!" },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: "Hi there! How can I help you today?",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.chat(mockMessages);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseURL}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          },
          body: JSON.stringify({
            model: mockModel,
            messages: mockMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        }
      );

      expect(result).toEqual({
        content: "Hi there! How can I help you today?",
        provider: "deepseek",
        model: mockModel,
      });
    });

    it("should handle API errors", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(provider.chat(mockMessages)).rejects.toThrow(
        "DeepSeek API error: Bad Request"
      );
    });
  });

  describe("createEmbeddings", () => {
    it("should create embeddings correctly", async () => {
      const mockInput = "Hello, world!";
      const mockEmbedding = [0.1, 0.2, 0.3];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding }],
        }),
      });

      const result = await provider.createEmbeddings({ input: mockInput });

      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-embedding",
          input: [mockInput],
        }),
      });

      expect(result).toEqual({
        embeddings: [mockEmbedding],
        provider: "deepseek",
        model: "deepseek-embedding",
      });
    });

    it("should handle array input", async () => {
      const mockInputs = ["Hello", "world"];
      const mockEmbedding = [0.1, 0.2, 0.3];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding }],
        }),
      });

      const result = await provider.createEmbeddings({ input: mockInputs });

      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-embedding",
          input: mockInputs,
        }),
      });

      expect(result).toEqual({
        embeddings: [mockEmbedding],
        provider: "deepseek",
        model: "deepseek-embedding",
      });
    });

    it("should handle embedding errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(
        provider.createEmbeddings({ input: "test" })
      ).rejects.toThrow("DeepSeek API error: Bad Request");
    });
  });

  describe("unsupported features", () => {
    it("should throw error for image generation", async () => {
      const generateImage = provider.generateImage?.bind(provider);
      await expect(generateImage?.()).rejects.toThrow(
        "Image generation is not supported by DeepSeek"
      );
    });

    it("should throw error for assistants API methods", () => {
      expect(() => provider.createAssistant?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.listAssistants?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.deleteAssistant?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.createThread?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.getThread?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.addMessage?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.runAssistant?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
      expect(() => provider.getAssistantResponse?.()).toThrow(
        "Assistants API is not supported by DeepSeek"
      );
    });
  });
});
