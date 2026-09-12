"use client";

import { useEffect, useState } from "react";

function parseHex(hex: string) {
  const h = hex.replace("#", "").trim();
  if (h.length < 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lum(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function sat(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Tint fabric onto pure white while keeping seam/fold contrast readable —
 * especially for soft-black and navy (no flat silhouette).
 */
export function useGarmentPreview(
  src: string | null | undefined,
  colorHex?: string | null,
) {
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
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          if (!cancelled) setUrl(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const total = w * h;

        const isStageWhite = (i: number) => {
          if (data[i + 3] < 10) return true;
          const L = lum(data[i], data[i + 1], data[i + 2]);
          const S = sat(data[i], data[i + 1], data[i + 2]);
          return L >= 0.93 && S <= 0.08;
        };

        const samples: number[] = [];
        for (let idx = 0; idx < total; idx++) {
          const i = idx * 4;
          if (isStageWhite(i)) continue;
          samples.push(lum(data[i], data[i + 1], data[i + 2]));
        }
        samples.sort((a, b) => a - b);
        const pick = (p: number) =>
          samples.length
            ? samples[
                Math.min(samples.length - 1, Math.floor(samples.length * p))
              ]
            : 0.5;
        const Lmin = pick(0.06);
        const Lmax = Math.max(pick(0.94), Lmin + 0.08);
        const Lref = pick(0.5);
        const range = Lmax - Lmin;

        const target = colorHex ? parseHex(colorHex) : null;
        const targetLum = target ? lum(target.r, target.g, target.b) : 0.5;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        const out = ctx.getImageData(0, 0, w, h);
        const od = out.data;

        for (let idx = 0; idx < total; idx++) {
          const i = idx * 4;
          if (isStageWhite(i)) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const L = lum(r, g, b);
          // 0..1 shading across fabric (amplifies seams / brim edge).
          const t = Math.min(1, Math.max(0, (L - Lmin) / range));

          if (target) {
            let shade: number;
            let lift = 0;
            if (targetLum >= 0.72) {
              shade = 0.58 + t * 0.48;
              lift = t * t * 0.08;
            } else if (targetLum <= 0.32) {
              // Soft black: keep mid fabric readable + brighten panel edges/seams.
              shade = 0.38 + Math.pow(t, 0.85) * 0.95;
              lift = Math.pow(t, 1.35) * 0.28;
            } else {
              shade = Math.min(1.35, Math.max(0.18, L / Math.max(Lref, 0.08)));
              lift = Math.pow(t, 1.5) * 0.1;
            }
            od[i] = Math.round(Math.min(255, target.r * shade + 255 * lift));
            od[i + 1] = Math.round(Math.min(255, target.g * shade + 255 * lift));
            od[i + 2] = Math.round(Math.min(255, target.b * shade + 255 * lift));
          } else {
            od[i] = r;
            od[i + 1] = g;
            od[i + 2] = b;
          }
          od[i + 3] = 255;
        }

        ctx.putImageData(out, 0, 0);
        canvas.toBlob((blob) => {
          if (cancelled) return;
          if (!blob) {
            setUrl(src);
            return;
          }
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }, "image/png");
      } catch {
        if (!cancelled) setUrl(src);
      }
    };

    img.onerror = () => {
      if (!cancelled) setUrl(src);
    };

    const cacheBust = src.includes("?") ? src : `${src}?v=cap-real-15`;
    img.src = cacheBust;

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, colorHex]);

  return url;
}
