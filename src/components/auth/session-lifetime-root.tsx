"use client";

import { useEffect } from "react";
import {
  AUTH_HEARTBEAT_INTERVAL_MS,
  AUTH_HEARTBEAT_KEY,
  AUTH_HEARTBEAT_STALE_MS,
  clearAuthLifetimeClientState,
  readAuthPresenceCookie,
  writeAuthPresenceCookie,
} from "@/lib/auth/session-lifetime";

type SessionPayload = { user?: { id?: string } | null } | null;

/**
 * Enforces browser-session login:
 * - Presence is a session cookie (cleared when Chrome quits).
 * - If Auth.js still has a user but presence is missing → force sign-out.
 * - Idle fallback if Chrome restores cookies after a long quit.
 */
export function SessionLifetimeRoot() {
  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;

    const beat = () => {
      try {
        localStorage.setItem(AUTH_HEARTBEAT_KEY, String(Date.now()));
      } catch {
        // Ignore.
      }
      writeAuthPresenceCookie();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };

    const endSession = () => {
      clearAuthLifetimeClientState();
      window.location.replace("/auth/end-session");
    };

    void (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
          headers: { "ngrok-skip-browser-warning": "1" },
        });
        if (cancelled) return;

        // Never force-logout on auth screens (breaks sign-in).
        if (window.location.pathname.startsWith("/auth/")) {
          return;
        }

        if (!res.ok) {
          clearAuthLifetimeClientState();
          return;
        }

        const session = (await res.json()) as SessionPayload;
        if (cancelled) return;

        if (!session?.user) {
          clearAuthLifetimeClientState();
          return;
        }

        const hasPresence = readAuthPresenceCookie();
        const last = Number(localStorage.getItem(AUTH_HEARTBEAT_KEY) || 0);
        const idleTooLong =
          last > 0 && Date.now() - last > AUTH_HEARTBEAT_STALE_MS;

        // Missing presence = browser was closed (session cookie wiped).
        // Never recreate presence here — that was keeping people logged in.
        if (!hasPresence) {
          endSession();
          return;
        }

        // Chrome "continue where you left off" can restore session cookies;
        // idle marker still proves the machine was away.
        if (idleTooLong) {
          endSession();
          return;
        }

        beat();
        intervalId = window.setInterval(beat, AUTH_HEARTBEAT_INTERVAL_MS);
        document.addEventListener("visibilitychange", onVisibility);
      } catch {
        if (!cancelled) clearAuthLifetimeClientState();
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

/** Clears lifetime markers on auth screens so a fresh login can establish presence. */
export function ClearAuthLifetimeOnMount() {
  useEffect(() => {
    clearAuthLifetimeClientState();
  }, []);
  return null;
}
