import { MockAiProvider } from "./mock-provider";
import type { AiProvider } from "./types";

let provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!provider) {
    const mode = process.env.AI_PROVIDER ?? "mock";
    if (mode === "mock") {
      provider = new MockAiProvider();
    } else {
      // Real providers (Replicate, fal, OpenAI, etc.) register here in Phase 4.
      provider = new MockAiProvider();
    }
  }
  return provider;
}

export * from "./types";
