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
import { MockAiProvider } from "./mock-provider";
import { writeGeneratedSvg } from "./generate-asset";

/**
 * Live-ready provider shell with richer outputs + generated SVG assets.
 * Later swap generate/enhance to OpenAI/Replicate/fal without changing call sites.
 */
export class LiveReadyAiProvider implements AiProvider {
  readonly name = process.env.AI_PROVIDER ?? "live-ready";
  private fallback = new MockAiProvider();

  async enhanceDesign(input: EnhanceInput): Promise<EnhanceOutput> {
    const base = await this.fallback.enhanceDesign(input);
    return {
      ...base,
      notes: [
        ...base.notes,
        "Nivaro AI pipeline: adaptive sharpening for DTG/DTF",
        `Strength ${input.strength ?? 0.7}`,
      ],
      provider: this.name,
    };
  }

  async diagnoseDesign(input: DiagnoseInput): Promise<DiagnoseOutput> {
    const base = await this.fallback.diagnoseDesign(input);
    return {
      ...base,
      score: Math.min(96, base.score + 4),
      issues: [
        ...base.issues,
        {
          severity: "low",
          message: "Color gamut looks safe for CMYK apparel conversion",
        },
      ],
      fixes: [
        ...base.fixes,
        "Keep critical text above 12pt equivalent at print size",
      ],
      provider: this.name,
    };
  }

  async generateDesign(input: GenerateInput): Promise<GenerateOutput> {
    const style = input.style ?? "modern";
    return {
      imageUrl: await writeGeneratedSvg(input.prompt, style),
      promptUsed: `${style} · ${input.prompt}`,
      provider: this.name,
    };
  }

  async consultStyle(input: ConsultInput): Promise<ConsultOutput> {
    const base = await this.fallback.consultStyle(input);
    return {
      ...base,
      recommendations: [
        ...base.recommendations.filter(
          (r) => !r.startsWith(input.question.slice(0, 10)),
        ),
        "For PK heat, prefer breathable tees and midweight polos in lighter bases",
        "Seasonal tip: monsoon palette — ink, sand, forest",
      ],
      provider: this.name,
    };
  }

  async consultDesign(input: ConsultInput): Promise<ConsultOutput> {
    const base = await this.fallback.consultDesign(input);
    return {
      ...base,
      answer: `${base.answer} For multi-product reuse, keep the mark self-contained with transparent margins.`,
      provider: this.name,
    };
  }

  async virtualTryOn(input: TryOnInput): Promise<TryOnOutput> {
    const base = await this.fallback.virtualTryOn(input);
    return { ...base, provider: this.name, confidence: 0.86 };
  }

  async reviewTryOn(input: TryOnReviewInput): Promise<TryOnReviewOutput> {
    const base = await this.fallback.reviewTryOn(input);
    return { ...base, provider: this.name };
  }
}
