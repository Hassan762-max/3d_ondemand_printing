export type TryOnReviewData = {
  overall: "great" | "good" | "needs_work";
  feedback: string[];
  suggestions: string[];
  provider: string;
};

export type TryOnHistoryItem = {
  id: string;
  resultUrl: string;
  review: TryOnReviewData;
  note?: string;
  createdAt: string;
};

export type TryOnMeta = {
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  colorHex: string;
  designId?: string | null;
  designTitle?: string | null;
  garmentPreviewUrl: string;
  confidence?: number;
  latestReview?: TryOnReviewData | null;
  history: TryOnHistoryItem[];
  compareIds?: string[];
  finalized?: boolean;
};

export function parseTryOnMeta(raw: string | null | undefined): TryOnMeta | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TryOnMeta;
  } catch {
    return null;
  }
}
