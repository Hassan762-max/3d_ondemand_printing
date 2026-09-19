/**
 * Same-origin Auth.js credentials sign-in (browser).
 * Avoids next-auth/react hanging when AUTH_URL / ngrok host is wrong.
 */
export type CredentialsSignInResult =
  | { ok: true }
  | { ok: false; message: string };

export async function credentialsSignIn(
  email: string,
  password: string,
  options?: { timeoutMs?: number },
): Promise<CredentialsSignInResult> {
  const timeoutMs = options?.timeoutMs ?? 12_000;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const csrfRes = await fetch("/api/auth/csrf", {
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!csrfRes.ok) {
      return {
        ok: false,
        message:
          "Could not reach the auth service on this URL. Open the live ngrok .dev link (not .app).",
      };
    }

    const csrfJson = (await csrfRes.json()) as { csrfToken?: string };
    if (!csrfJson.csrfToken) {
      return { ok: false, message: "Missing CSRF token. Refresh and try again." };
    }

    const body = new URLSearchParams({
      csrfToken: csrfJson.csrfToken,
      email,
      password,
      callbackUrl: `${window.location.origin}/`,
      json: "true",
    });

    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      credentials: "include",
      signal: controller.signal,
      redirect: "follow",
    });

    // Auth.js may return 200 JSON, 302, or 401.
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: "Invalid email or password." };
    }

    let payload: { url?: string; error?: string; ok?: boolean } | null = null;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = (await res.json()) as {
        url?: string;
        error?: string;
        ok?: boolean;
      };
    }

    if (payload?.error) {
      return { ok: false, message: "Invalid email or password." };
    }

    if (!res.ok && res.status !== 302) {
      return {
        ok: false,
        message:
          "Sign-in failed on this host. Use https://feminism-purposely-jelly.ngrok-free.dev",
      };
    }

    // Confirm session cookie landed.
    const sessionRes = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!sessionRes.ok) {
      return { ok: false, message: "Signed in but session check failed. Retry." };
    }
    const session = (await sessionRes.json()) as { user?: unknown };
    if (!session?.user) {
      return { ok: false, message: "Invalid email or password." };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message:
          "Sign-in timed out. You may be on a dead ngrok host (.app). Use the .dev URL.",
      };
    }
    return {
      ok: false,
      message:
        "Network error during sign-in. Confirm Next.js + ngrok are running on the .dev URL.",
    };
  } finally {
    window.clearTimeout(timer);
  }
}
