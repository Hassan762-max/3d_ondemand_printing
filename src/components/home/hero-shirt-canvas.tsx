"use client";

import { useEffect, useRef } from "react";

/**
 * Tearless soft black tee — Dizzy Engine on Sketchfab (CC BY):
 * https://sketchfab.com/3d-models/black-t-shirt-f335319363024c58b907533fe5e89627
 *
 * Sketchfab free embeds still paint title/logo chrome; we hide those with
 * opaque white bands (shirt stays visible in the center).
 */
const SKETCHFAB_UID = "f335319363024c58b907533fe5e89627";

type SketchfabApi = {
  start: () => void;
  addEventListener: (event: string, cb: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    Sketchfab?: new (
      version: string,
      iframe: HTMLIFrameElement,
    ) => {
      init: (uid: string, options: Record<string, unknown>) => void;
    };
  }
}

function loadSketchfabScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Sketchfab) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-sketchfab-api="1"]',
    );
    if (existing) {
      if (window.Sketchfab) resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("api")));
      }
      return;
    }
    const script = document.createElement("script");
    script.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
    script.async = true;
    script.dataset.sketchfabApi = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("api"));
    document.body.appendChild(script);
  });
}

const VIEWER_OPTS = {
  autostart: 1,
  preload: 1,
  transparent: 1,
  ui_theme: "dark",
  ui_infos: 0,
  ui_controls: 0,
  ui_stop: 0,
  ui_inspector: 0,
  ui_watermark: 0,
  ui_watermark_link: 0,
  ui_hint: 0,
  ui_help: 0,
  ui_settings: 0,
  ui_vr: 0,
  ui_fullscreen: 0,
  ui_annotations: 0,
  ui_color: "FFFFFF",
  dnt: 1,
} as const;

export function HeroShirtCanvas() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    const iframe = iframeRef.current;
    if (!iframe) return;

    (async () => {
      try {
        await loadSketchfabScript();
        if (cancelled || !window.Sketchfab || !iframe) return;

        const client = new window.Sketchfab("1.12.1", iframe);
        client.init(SKETCHFAB_UID, {
          ...VIEWER_OPTS,
          success: (api: SketchfabApi) => {
            if (cancelled) return;
            api.start();
          },
          error: () => undefined,
        });
      } catch {
        // ignore — iframe stays blank white until API loads
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <iframe
        ref={iframeRef}
        title="Black T-Shirt 3D model"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0 bg-white"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[3.75rem] bg-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-t from-white from-55% to-transparent"
      />
    </div>
  );
}
