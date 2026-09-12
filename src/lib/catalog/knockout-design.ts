"use client";

import { useEffect, useState } from "react";

/** Near-white / pale gray with low saturation — typical flat design backgrounds. */
function isBackgroundPixel(r: number, g: number, b: number, a: number) {
  if (a < 8) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum >= 0.86 && sat <= 0.14;
}

/**
 * Knock out flat white/light backgrounds connected to the image edges
 * so artwork (including white ink inside the design) stays intact.
 */
export function knockoutEdgeBackground(
  imageData: ImageData,
  softEdge = true,
): ImageData {
  const { width, height, data } = imageData;
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qh = 0;
  let qt = 0;

  const push = (idx: number) => {
    if (bg[idx]) return;
    const i = idx * 4;
    if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      return;
    }
    bg[idx] = 1;
    queue[qt++] = idx;
  };

  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + (width - 1));
  }

  while (qh < qt) {
    const idx = queue[qh++];
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) push(idx - 1);
    if (x + 1 < width) push(idx + 1);
    if (y > 0) push(idx - width);
    if (y + 1 < height) push(idx + width);
  }

  for (let i = 0; i < total; i++) {
    if (!bg[i]) continue;
    data[i * 4 + 3] = 0;
  }

  if (softEdge) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (bg[idx]) continue;
        let near = 0;
        if (bg[idx - 1]) near++;
        if (bg[idx + 1]) near++;
        if (bg[idx - width]) near++;
        if (bg[idx + width]) near++;
        if (near === 0) continue;
        const i = idx * 4;
        if (isBackgroundPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
          data[i + 3] = Math.round(data[i + 3] * (1 - near * 0.22));
        }
      }
    }
  }

  return imageData;
}

export function useKnockoutDesign(src: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          if (!cancelled) setUrl(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        knockoutEdgeBackground(imageData);
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (cancelled) return;
            if (!blob) {
              setUrl(src);
              return;
            }
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          },
          "image/png",
        );
      } catch {
        if (!cancelled) setUrl(src);
      }
    };

    img.onerror = () => {
      if (!cancelled) setUrl(src);
    };

    img.src = src;

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return url;
}
