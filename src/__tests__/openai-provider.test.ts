import { OpenAIProvider } from "../providers/openai";
import OpenAI from "openai";

// Mock the OpenAI class
const mockCreate = jest.fn();
const mockGenerateImage = jest.fn();
const mockCreateEmbedding = jest.fn();
const mockCreateAssistant = jest.fn();
const mockListAssistants = jest.fn();
const mockDeleteAssistant = jest.fn();
const mockCreateThread = jest.fn();
const mockListMessages = jest.fn();
const mockCreateMessage = jest.fn();
const mockCreateRun = jest.fn();
const mockRetrieveRun = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
    images: {
      generate: mockGenerateImage,
    },
    embeddings: {
      create: mockCreateEmbedding,
    },
    beta: {
      assistants: {
        create: mockCreateAssistant,
        list: mockListAssistants,
        del: mockDeleteAssistant,
      },
      threads: {
        create: mockCreateThread,
        messages: {
          list: mockListMessages,
          create: mockCreateMessage,
        },
        runs: {
          create: mockCreateRun,
          retrieve: mockRetrieveRun,
        },
      },
    },
  }));
});

describe("OpenAIProvider", () => {
  let provider: OpenAIProvider;
  const mockApiKey = "test-api-key";
  const mockModel = "gpt-4";

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OpenAIProvider(mockApiKey, mockModel);
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

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await provider.chat(mockMessages);

      expect(mockCreate).toHaveBeenCalledWith({
        model: mockModel,
        messages: mockMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      expect(result).toEqual({
        content: "Hi there! How can I help you today?",
        provider: "openai",
        model: mockModel,
      });
    });

    it("should handle empty response content", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];
      const mockResponse = {
        choices: [{ message: { content: null } }],
      };

      mockCreate.mockResolvedValueOnce(mockResponse);
      const result = await provider.chat(mockMessages);
      expect(result.content).toBe("");
    });

    it("should throw error when API call fails", async () => {
      const mockMessages = [{ role: "user" as const, content: "Hello!" }];
      const mockError = new Error("API Error");
      mockCreate.mockRejectedValueOnce(mockError);
      await expect(provider.chat(mockMessages)).rejects.toThrow("API Error");
    });
  });

  describe("generateImage", () => {
    it("should generate images correctly", async () => {
      const mockOptions = {
        prompt: "A beautiful sunset",
        n: 2,
        size: "1024x1024" as const,
        quality: "standard" as const,
        style: "natural" as const,
      };

      const mockResponse = {
        data: [
          { url: "http://example.com/image1.jpg" },
          { url: "http://example.com/image2.jpg" },
        ],
      };

      mockGenerateImage.mockResolvedValueOnce(mockResponse);

      const result = await provider.generateImage(mockOptions);

      expect(mockGenerateImage).toHaveBeenCalledWith(mockOptions);
      expect(result).toEqual({
        urls: [
          "http://example.com/image1.jpg",
          "http://example.com/image2.jpg",
        ],
        provider: "openai",
      });
    });

    it("should handle null URLs", async () => {
      const mockResponse = {
        data: [{ url: null }],
      };

      mockGenerateImage.mockResolvedValueOnce(mockResponse);
      const result = await provider.generateImage({ prompt: "test" });
      expect(result.urls).toEqual([""]);
    });
  });

  describe("createEmbeddings", () => {
    it("should create embeddings correctly", async () => {
      const mockOptions = {
        input: "Hello, world!",
        model: "text-embedding-ada-002",
      };

      const mockResponse = {
        data: [
          {
            embedding: [0.1, 0.2, 0.3],
          },
        ],
      };

      mockCreateEmbedding.mockResolvedValueOnce(mockResponse);

      const result = await provider.createEmbeddings(mockOptions);

      expect(mockCreateEmbedding).toHaveBeenCalledWith(mockOptions);
      expect(result).toEqual({
        embeddings: [[0.1, 0.2, 0.3]],
        provider: "openai",
        model: "text-embedding-ada-002",
      });
    });
  });

  describe("assistants", () => {
    it("should create assistant correctly", async () => {
      const mockAssistant = {
        id: "asst_123",
        name: "Test Assistant",
        description: "Test Description",
        model: "gpt-4",
        instructions: "Be helpful",
      };

      mockCreateAssistant.mockResolvedValueOnce(mockAssistant);

      const result = await provider.createAssistant("Test Assistant", {
        description: "Test Description",
        instructions: "Be helpful",
      });

      expect(result).toEqual(mockAssistant);
    });

    it("should list assistants correctly", async () => {
      const mockAssistants = {
        data: [
          {
            id: "asst_123",
            name: "Assistant 1",
            model: "gpt-4",
          },
          {
            id: "asst_456",
            name: "Assistant 2",
            model: "gpt-4",
          },
        ],
      };

      mockListAssistants.mockResolvedValueOnce(mockAssistants);

      const result = await provider.listAssistants();

      expect(result).toEqual(
        mockAssistants.data.map((a) => ({
          ...a,
          description: undefined,
          instructions: undefined,
        }))
      );
    });

    it("should delete assistant correctly", async () => {
      mockDeleteAssistant.mockResolvedValueOnce({ deleted: true });
      const result = await provider.deleteAssistant("asst_123");
      expect(result).toBe(true);
    });
  });

  describe("threads", () => {
    it("should create thread correctly", async () => {
      const mockThread = {
        id: "thread_123",
      };

      mockCreateThread.mockResolvedValueOnce(mockThread);

      const result = await provider.createThread();

      expect(result).toEqual({
        id: mockThread.id,
        messages: [],
      });
    });

    it("should get thread correctly", async () => {
      const mockMessages = {
        data: [
          {
            id: "msg_123",
            role: "user",
            content: [{ type: "text", text: { value: "Hello!" } }],
          },
        ],
      };

      mockListMessages.mockResolvedValueOnce(mockMessages);

      const result = await provider.getThread("thread_123");

      expect(result).toEqual({
        id: "thread_123",
        messages: [
          {
            role: "user",
            content: "Hello!",
          },
        ],
      });
    });

    it("should add message correctly", async () => {
      const message = {
        role: "user" as const,
        content: "Hello!",
      };

      await provider.addMessage("thread_123", message);

      expect(mockCreateMessage).toHaveBeenCalledWith("thread_123", {
        role: "user",
        content: "Hello!",
      });
    });
  });

  describe("runs", () => {
    it("should run assistant correctly", async () => {
      const mockRun = {
        id: "run_123",
        status: "completed",
      };

      mockCreateRun.mockResolvedValueOnce(mockRun);

      const result = await provider.runAssistant("asst_123", "thread_123");

      expect(result).toEqual({
        messageId: mockRun.id,
        threadId: "thread_123",
        content: "",
        status: "completed",
      });
    });

    it("should get assistant response correctly", async () => {
      const mockRun = {
        status: "completed",
      };

      const mockMessages = {
        data: [
          {
            id: "msg_123",
            content: [{ type: "text", text: { value: "Hello!" } }],
          },
        ],
      };

      mockRetrieveRun.mockResolvedValueOnce(mockRun);
      mockListMessages.mockResolvedValueOnce(mockMessages);

      const result = await provider.getAssistantResponse(
        "thread_123",
        "run_123"
      );

      expect(result).toEqual({
        messageId: "msg_123",
        threadId: "thread_123",
        content: "Hello!",
        status: "completed",
      });
    });
  });
});
