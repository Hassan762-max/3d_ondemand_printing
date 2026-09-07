export type StudioSide = "front" | "back";

export type Placement = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type CameraPreset = "free" | "front" | "back" | "left" | "right";

export type StudioSnapshot = {
  id: string;
  label: string;
  productId: string;
  designId: string | null;
  color: string;
  colorHex: string;
  size: string;
  side: StudioSide;
  placement: Placement;
  createdAt: number;
};

export type StudioProductOption = {
  id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl: string | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
};

export type StudioDesignOption = {
  id: string;
  title: string;
  imageUrl: string;
  isLibrary: boolean;
};

export const DEFAULT_PLACEMENT: Placement = {
  x: 0.5,
  y: 0.42,
  scale: 1,
  rotation: 0,
};
