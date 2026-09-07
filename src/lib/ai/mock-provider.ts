import type {
  AiProvider,
  ConsultInput,
  ConsultOutput,
  DiagnoseInput,
  DiagnoseOutput,
  EnhanceInput,
  EnhanceOutput,
  GenerateInput,
  GenerateOutput,
  TryOnInput,
  TryOnOutput,
  TryOnReviewInput,
  TryOnReviewOutput,
} from "./types";

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

/** High-quality stub provider — real models plug in behind the same interface. */
export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async enhanceDesign(input: EnhanceInput): Promise<EnhanceOutput> {
    await delay();
    return {
      imageUrl: input.imageUrl,
      notes: [
        "Upscaled edge clarity for print",
        "Balanced contrast for apparel ink",
        "Removed low-frequency noise",
      ],
      provider: this.name,
    };
  }

  async diagnoseDesign(input: DiagnoseInput): Promise<DiagnoseOutput> {
    await delay();
    return {
      score: 78,
      issues: [
        {
          severity: "medium",
          message: "Fine lines may soften on cotton knit after wash",
        },
        {
          severity: "low",
          message: "Background whitespace is generous — good for chest print",
        },
      ],
      fixes: [
        "Increase stroke weight on thin details",
        "Export at 300 DPI for A4 print area",
        input.productCategory
          ? `Preview on ${input.productCategory.replaceAll("_", " ").toLowerCase()} mockup`
          : "Preview on target garment mockup",
      ],
      provider: this.name,
    };
  }

  async generateDesign(input: GenerateInput): Promise<GenerateOutput> {
    await delay(600);
    return {
      imageUrl: "/designs/generated-placeholder.svg",
      promptUsed: `${input.style ?? "modern"} · ${input.prompt}`,
      provider: this.name,
    };
  }

  async consultStyle(input: ConsultInput): Promise<ConsultOutput> {
    await delay();
    return {
      answer:
        "For Pakistan street-premium looks, pair oversized silhouettes with restrained monochrome graphics and one accent color.",
      recommendations: [
        "Try oversized tee in charcoal with a single front graphic",
        "Keep back print smaller than front for balance",
        "Neutral bottoms let the print lead",
        input.question.slice(0, 80),
      ],
      provider: this.name,
    };
  }

  async consultDesign(input: ConsultInput): Promise<ConsultOutput> {
    await delay();
    return {
      answer:
        "Center the motif slightly above chest midline, leave ~40% negative space, and avoid edge-to-edge fills on light garments.",
      recommendations: [
        "Scale to 70–85% of chest print area",
        "Test on both light and dark garment colors",
        "Offer a muted colorway for broader appeal",
      ],
      provider: this.name,
    };
  }

  async virtualTryOn(input: TryOnInput): Promise<TryOnOutput> {
    await delay(800);
    return {
      resultUrl: input.photoUrl,
      confidence: 0.82,
      provider: this.name,
    };
  }

  async reviewTryOn(input: TryOnReviewInput): Promise<TryOnReviewOutput> {
    await delay();
    return {
      overall: "good",
      feedback: [
        `${input.productName} drapes naturally in the preview`,
        "Print contrast is readable in indoor lighting",
        input.size
          ? `Selected size ${input.size} looks proportionate`
          : "Confirm size against your usual fit",
      ],
      suggestions: [
        "Try one size up for an oversized street look",
        "Shift print 5–8% upward for a taller visual",
        "Compare on a darker garment color",
      ],
      provider: this.name,
    };
  }
}
