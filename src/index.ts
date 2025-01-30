import { AIConfig, AIClient } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { ClaudeProvider } from "./providers/claude";
import { DeepSeekProvider } from "./providers/deepseek";

export * from "./types";

export class AnyChat {
  static createClient(config: AIConfig): AIClient {
    switch (config.provider) {
      case "openai":
        return new OpenAIProvider(config.apiKey, config.model);
      case "gemini":
        return new GeminiProvider(config.apiKey, config.model);
      case "claude":
        return new ClaudeProvider(config.apiKey, config.model);
      case "deepseek":
        return new DeepSeekProvider(
          config.apiKey,
          config.model,
          config.baseURL
        );
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }
}
