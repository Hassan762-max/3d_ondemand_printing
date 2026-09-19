import { z } from "zod";

const boolish = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null || v === "") return undefined;
    const n = v.toLowerCase();
    if (["1", "true", "yes", "on"].includes(n)) return true;
    if (["0", "false", "no", "off"].includes(n)) return false;
    return undefined;
  });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /** Deploy-time environment. Prefer this over NODE_ENV (next build sets NODE_ENV=production). */
  APP_ENV: z.enum(["development", "test", "staging", "production"]).optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().optional(),
  AUTH_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).optional(),
  NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS: z.string().optional(),
  AI_PROVIDER: z.string().optional(),
  PAYMENT_PROVIDER: z.string().optional(),
  STORAGE_PROVIDER: z.string().optional(),
  NOTIFY_PROVIDER: z.string().optional(),
  CAPACITOR_SERVER_URL: z.string().optional(),
  ALLOW_DEMO_CREDENTIALS: boolish,
  ALLOW_PAYMENT_STUB: boolish,
  JAZZCASH_MERCHANT_ID: z.string().optional(),
  JAZZCASH_PASSWORD: z.string().optional(),
  EASYPAISA_STORE_ID: z.string().optional(),
  EASYPAISA_PASSWORD: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

/** True only when explicitly deploying as production (not merely `next build`). */
export function isProductionDeploy(): boolean {
  const appEnv = (process.env.APP_ENV || "").toLowerCase();
  if (appEnv === "production") return true;
  if (process.env.VERCEL_ENV === "production") return true;
  return false;
}

function assertProductionSecrets(data: AppEnv) {
  if (!isProductionDeploy()) return;

  if (!data.AUTH_SECRET || data.AUTH_SECRET.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to a strong random value (≥32 characters) when APP_ENV=production",
    );
  }
  if (
    data.AUTH_SECRET.includes("replace-with") ||
    data.AUTH_SECRET.includes("ci-secret") ||
    data.AUTH_SECRET === "printora-dev-secret-change-in-production"
  ) {
    throw new Error(
      "AUTH_SECRET appears to be a development/placeholder value — refuse to start in production",
    );
  }
  if (!data.AUTH_URL?.startsWith("https://")) {
    throw new Error("AUTH_URL must be an https:// URL when APP_ENV=production");
  }
  if (data.DATABASE_URL.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must not use SQLite (file:) when APP_ENV=production — use PostgreSQL with sslmode=require",
    );
  }
}

/**
 * Validate process.env. Production deploys (APP_ENV=production) fail fast on
 * missing/weak secrets. Local `next build` with NODE_ENV=production is allowed.
 */
export function getEnv(): AppEnv {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    NODE_ENV: process.env.NODE_ENV || "development",
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    const message = `Invalid environment configuration: ${details}`;
    if (isProductionDeploy()) throw new Error(message);
    console.warn(`[env] ${message}`);
    cached = {
      NODE_ENV: (process.env.NODE_ENV as AppEnv["NODE_ENV"]) || "development",
      DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    } as AppEnv;
    return cached;
  }

  assertProductionSecrets(parsed.data);
  cached = parsed.data;
  return cached;
}

/**
 * Whether the UI may show demo login hints.
 * Always false — seed accounts can remain for local DB use, but credentials
 * must never appear in customer-facing UI (including local/dev).
 */
export function allowDemoCredentials(): boolean {
  return false;
}

/** Reset cache (tests only). */
export function resetEnvCache() {
  cached = null;
}
