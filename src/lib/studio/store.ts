"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  DEFAULT_PLACEMENT,
  type CameraPreset,
  type Placement,
  type StudioDesignOption,
  type StudioProductOption,
  type StudioSide,
  type StudioSnapshot,
} from "./types";

type StudioState = {
  products: StudioProductOption[];
  designs: StudioDesignOption[];
  productId: string | null;
  designId: string | null;
  color: string;
  colorHex: string;
  size: string;
  side: StudioSide;
  placement: Placement;
  cameraPreset: CameraPreset;
  snapshots: StudioSnapshot[];
  compareId: string | null;
  hydrated: boolean;

  hydrate: (input: {
    products: StudioProductOption[];
    designs: StudioDesignOption[];
    initialProductSlug?: string | null;
    initialDesignId?: string | null;
  }) => void;
  setProduct: (productId: string) => void;
  setDesign: (designId: string | null) => void;
  setColor: (name: string, hex: string) => void;
  setSize: (size: string) => void;
  setSide: (side: StudioSide) => void;
  setPlacement: (partial: Partial<Placement>) => void;
  resetPlacement: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  saveSnapshot: () => void;
  removeSnapshot: (id: string) => void;
  restoreSnapshot: (id: string) => void;
  setCompareId: (id: string | null) => void;
};

export const useStudioStore = create<StudioState>((set, get) => ({
  products: [],
  designs: [],
  productId: null,
  designId: null,
  color: "Ink",
  colorHex: "#12141A",
  size: "M",
  side: "front",
  placement: { ...DEFAULT_PLACEMENT },
  cameraPreset: "free",
  snapshots: [],
  compareId: null,
  hydrated: false,

  hydrate: ({ products, designs, initialProductSlug, initialDesignId }) => {
    const wasHydrated = get().hydrated;
    const productFromUrl = initialProductSlug
      ? products.find((p) => p.slug === initialProductSlug)
      : undefined;
    const designFromUrl = initialDesignId
      ? designs.find((d) => d.id === initialDesignId)
      : undefined;

    if (!wasHydrated) {
      const product = productFromUrl ?? products[0] ?? null;
      const design = designFromUrl ?? designs[0] ?? null;
      set({
        products,
        designs,
        productId: product?.id ?? null,
        designId: design?.id ?? null,
        color: product?.colors[0]?.name ?? "Ink",
        colorHex: product?.colors[0]?.hex ?? "#12141A",
        size: product?.sizes[0] ?? "M",
        hydrated: true,
      });
      return;
    }

    set({
      products,
      designs,
      ...(productFromUrl
        ? {
            productId: productFromUrl.id,
            color: productFromUrl.colors[0]?.name ?? get().color,
            colorHex: productFromUrl.colors[0]?.hex ?? get().colorHex,
            size: productFromUrl.sizes.includes(get().size)
              ? get().size
              : (productFromUrl.sizes[0] ?? get().size),
          }
        : {}),
      ...(designFromUrl ? { designId: designFromUrl.id } : {}),
    });
  },

  setProduct: (productId) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return;
    set({
      productId,
      color: product.colors[0]?.name ?? get().color,
      colorHex: product.colors[0]?.hex ?? get().colorHex,
      size: product.sizes.includes(get().size)
        ? get().size
        : (product.sizes[0] ?? "M"),
    });
  },

  setDesign: (designId) => set({ designId }),

  setColor: (name, hex) => set({ color: name, colorHex: hex }),

  setSize: (size) => set({ size }),

  setSide: (side) => set({ side }),

  setPlacement: (partial) =>
    set({ placement: { ...get().placement, ...partial } }),

  resetPlacement: () => set({ placement: { ...DEFAULT_PLACEMENT } }),

  setCameraPreset: (cameraPreset) => set({ cameraPreset }),

  saveSnapshot: () => {
    const state = get();
    if (!state.productId) return;
    const snapshot: StudioSnapshot = {
      id: nanoid(8),
      label: `Look ${state.snapshots.length + 1}`,
      productId: state.productId,
      designId: state.designId,
      color: state.color,
      colorHex: state.colorHex,
      size: state.size,
      side: state.side,
      placement: { ...state.placement },
      createdAt: Date.now(),
    };
    set({ snapshots: [...state.snapshots.slice(-2), snapshot] });
  },

  removeSnapshot: (id) =>
    set({
      snapshots: get().snapshots.filter((s) => s.id !== id),
      compareId: get().compareId === id ? null : get().compareId,
    }),

  restoreSnapshot: (id) => {
    const snap = get().snapshots.find((s) => s.id === id);
    if (!snap) return;
    set({
      productId: snap.productId,
      designId: snap.designId,
      color: snap.color,
      colorHex: snap.colorHex,
      size: snap.size,
      side: snap.side,
      placement: { ...snap.placement },
    });
  },

  setCompareId: (compareId) => set({ compareId }),
}));

export function selectActiveProduct(state: StudioState) {
  return state.products.find((p) => p.id === state.productId) ?? null;
}

export function selectActiveDesign(state: StudioState) {
  return state.designs.find((d) => d.id === state.designId) ?? null;
}
