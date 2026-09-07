import { MockAiProvider } from "./mock-provider";
import { LiveReadyAiProvider } from "./live-ready-provider";
import type { AiProvider } from "./types";

let provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!provider) {
    const mode = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
    // "live" / "live-ready" uses the richer stub that writes generated assets.
    // Future: mode === "openai" | "replicate" | "fal" with real SDKs.
    if (mode === "live" || mode === "live-ready") {
      provider = new LiveReadyAiProvider();
    } else if (mode === "openai" || mode === "replicate" || mode === "fal") {
      // Keys not wired yet — keep interface stable and degrade gracefully.
      console.warn(
        `[ai] Provider "${mode}" selected but not configured; using live-ready stub.`,
      );
      provider = new LiveReadyAiProvider();
    } else {
      provider = new MockAiProvider();
    }
  }
  return provider;
}

export function resetAiProvider() {
  provider = null;
}

export * from "./types";
