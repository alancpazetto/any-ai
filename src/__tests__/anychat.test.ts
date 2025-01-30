import { AnyChat } from "../index";
import { OpenAIProvider } from "../providers/openai";
import { GeminiProvider } from "../providers/gemini";
import { ClaudeProvider } from "../providers/claude";
import { DeepSeekProvider } from "../providers/deepseek";

jest.mock("../providers/openai");
jest.mock("../providers/gemini");
jest.mock("../providers/claude");
jest.mock("../providers/deepseek");

describe("AnyChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create OpenAI client", () => {
    const config = {
      provider: "openai" as const,
      apiKey: "test-key",
      model: "gpt-4",
    };

    const client = AnyChat.createClient(config);
    expect(client).toBeInstanceOf(OpenAIProvider);
  });

  it("should create Gemini client", () => {
    const config = {
      provider: "gemini" as const,
      apiKey: "test-key",
      model: "gemini-pro",
    };

    const client = AnyChat.createClient(config);
    expect(client).toBeInstanceOf(GeminiProvider);
  });

  it("should create Claude client", () => {
    const config = {
      provider: "claude" as const,
      apiKey: "test-key",
      model: "claude-3-opus-20240229",
    };

    const client = AnyChat.createClient(config);
    expect(client).toBeInstanceOf(ClaudeProvider);
  });

  it("should create DeepSeek client", () => {
    const config = {
      provider: "deepseek" as const,
      apiKey: "test-key",
      model: "deepseek-chat",
      baseURL: "https://api.deepseek.com/v1",
    };

    const client = AnyChat.createClient(config);
    expect(client).toBeInstanceOf(DeepSeekProvider);
  });

  it("should throw error for unsupported provider", () => {
    const config = {
      provider: "unsupported" as any,
      apiKey: "test-key",
    };

    expect(() => AnyChat.createClient(config)).toThrow(
      "Unsupported provider: unsupported"
    );
  });
});
