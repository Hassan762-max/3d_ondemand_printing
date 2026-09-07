export type EnhanceInput = { imageUrl: string; strength?: number };
export type EnhanceOutput = {
  imageUrl: string;
  notes: string[];
  provider: string;
};

export type DiagnoseInput = { imageUrl: string; productCategory?: string };
export type DiagnoseOutput = {
  score: number;
  issues: { severity: "low" | "medium" | "high"; message: string }[];
  fixes: string[];
  provider: string;
};

export type GenerateInput = {
  prompt: string;
  style?: string;
};
export type GenerateOutput = {
  imageUrl: string;
  promptUsed: string;
  provider: string;
};

export type ConsultInput = {
  question: string;
  context?: Record<string, unknown>;
};
export type ConsultOutput = {
  answer: string;
  recommendations: string[];
  provider: string;
};

export type TryOnInput = {
  photoUrl: string;
  garmentPreviewUrl: string;
  productName: string;
};
export type TryOnOutput = {
  resultUrl: string;
  confidence: number;
  provider: string;
};

export type TryOnReviewInput = {
  resultUrl: string;
  productName: string;
  size?: string;
};
export type TryOnReviewOutput = {
  overall: "great" | "good" | "needs_work";
  feedback: string[];
  suggestions: string[];
  provider: string;
};

export interface AiProvider {
  readonly name: string;
  enhanceDesign(input: EnhanceInput): Promise<EnhanceOutput>;
  diagnoseDesign(input: DiagnoseInput): Promise<DiagnoseOutput>;
  generateDesign(input: GenerateInput): Promise<GenerateOutput>;
  consultStyle(input: ConsultInput): Promise<ConsultOutput>;
  consultDesign(input: ConsultInput): Promise<ConsultOutput>;
  virtualTryOn(input: TryOnInput): Promise<TryOnOutput>;
  reviewTryOn(input: TryOnReviewInput): Promise<TryOnReviewOutput>;
}
