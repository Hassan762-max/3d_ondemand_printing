/** localStorage activity marker (secondary idle check). */
export const AUTH_HEARTBEAT_KEY = "nivaro-auth-hb";

/**
 * Presence cookie value is a unix-ms timestamp of last activity.
 * Chrome can restore session cookies after quit; a stale timestamp still
 * proves the browser was closed / idle, so we reject it server-side.
 */
export const AUTH_PRESENCE_COOKIE = "nivaro-auth-presence";

/** Presence older than this is treated as logged out (covers Chrome restore). */
export const AUTH_PRESENCE_MAX_AGE_MS = 30_000;

export const AUTH_HEARTBEAT_STALE_MS = 30_000;

export const AUTH_HEARTBEAT_INTERVAL_MS = 8_000;

/** Server-safe: true only if presence cookie value is a fresh timestamp. */
export function isAuthPresenceValid(
  value: string | undefined | null,
  now = Date.now(),
): boolean {
  if (!value) return false;
  const issued = Number(value);
  if (!Number.isFinite(issued) || issued <= 0) return false;
  return now - issued <= AUTH_PRESENCE_MAX_AGE_MS;
}

export function clearAuthHeartbeat(): void {
  try {
    localStorage.removeItem(AUTH_HEARTBEAT_KEY);
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

export function clearAuthPresenceCookie(): void {
  try {
    document.cookie = `${AUTH_PRESENCE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // Ignore.
  }
}

export function clearAuthLifetimeClientState(): void {
  clearAuthHeartbeat();
  clearAuthPresenceCookie();
}

export function readAuthPresenceCookie(): boolean {
  try {
    const raw = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_PRESENCE_COOKIE}=`));
    if (!raw) return false;
    return isAuthPresenceValid(raw.slice(AUTH_PRESENCE_COOKIE.length + 1));
  } catch {
    return false;
  }
}

/** Refresh presence timestamp (session cookie, no Max-Age). */
export function writeAuthPresenceCookie(): void {
  try {
    const secure =
      typeof location !== "undefined" && location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${AUTH_PRESENCE_COOKIE}=${Date.now()}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Ignore.
  }
}

/**
 * Before paint: missing/stale presence + prior activity → end Auth.js session.
 */
export function sessionLifetimeBootstrapScript(): string {
  return `(function(){try{var ck=${JSON.stringify(AUTH_PRESENCE_COOKIE)};var hk=${JSON.stringify(AUTH_HEARTBEAT_KEY)};var maxAge=${AUTH_PRESENCE_MAX_AGE_MS};var raw=document.cookie.split(";").map(function(p){return p.trim();}).find(function(p){return p.indexOf(ck+"=")===0;});var val=raw?raw.slice(ck.length+1):"";var issued=Number(val);var fresh=Number.isFinite(issued)&&issued>0&&(Date.now()-issued)<=maxAge;if(fresh)return;var last=Number(localStorage.getItem(hk)||0);if(last>0){localStorage.removeItem(hk);document.cookie=ck+"=; Path=/; Max-Age=0; SameSite=Lax";window.location.replace("/auth/end-session");}}catch(e){}})();`;
}
