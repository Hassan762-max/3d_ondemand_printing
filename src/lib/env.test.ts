import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  allowDemoCredentials,
  getEnv,
  isProductionDeploy,
  resetEnvCache,
} from "@/lib/env";

const ORIGINAL = { ...process.env };

describe("env validation", () => {
  beforeEach(() => {
    resetEnvCache();
    process.env = { ...ORIGINAL };
    delete process.env.APP_ENV;
    delete process.env.VERCEL_ENV;
    delete process.env.ALLOW_DEMO_CREDENTIALS;
    delete process.env.NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
    resetEnvCache();
  });

  it("accepts typical development configuration", () => {
    Object.assign(process.env, {
      NODE_ENV: "development",
      DATABASE_URL: "file:./dev.db",
      AUTH_SECRET: "dev-only-secret",
    });
    const env = getEnv();
    expect(env.DATABASE_URL).toContain("file:");
    expect(isProductionDeploy()).toBe(false);
    expect(allowDemoCredentials()).toBe(false);
  });

  it("allows next build (NODE_ENV=production) without APP_ENV", () => {
    Object.assign(process.env, {
      NODE_ENV: "production",
      DATABASE_URL: "file:./ci.db",
      AUTH_SECRET: "ci-secret-not-for-production",
    });
    expect(() => getEnv()).not.toThrow();
  });

  it("rejects weak AUTH_SECRET when APP_ENV=production", () => {
    Object.assign(process.env, {
      APP_ENV: "production",
      NODE_ENV: "production",
      DATABASE_URL:
        "postgresql://user:pass@db.example:5432/nivaro?sslmode=require",
      AUTH_SECRET: "short",
      AUTH_URL: "https://app.example.com",
    });
    expect(() => getEnv()).toThrow(/AUTH_SECRET/);
  });

  it("rejects SQLite DATABASE_URL when APP_ENV=production", () => {
    Object.assign(process.env, {
      APP_ENV: "production",
      NODE_ENV: "production",
      DATABASE_URL: "file:./prod.db",
      AUTH_SECRET: "a".repeat(40),
      AUTH_URL: "https://app.example.com",
    });
    expect(() => getEnv()).toThrow(/SQLite|file:/);
  });

  it("rejects http AUTH_URL when APP_ENV=production", () => {
    Object.assign(process.env, {
      APP_ENV: "production",
      NODE_ENV: "production",
      DATABASE_URL:
        "postgresql://user:pass@db.example:5432/nivaro?sslmode=require",
      AUTH_SECRET: "a".repeat(40),
      AUTH_URL: "http://app.example.com",
    });
    expect(() => getEnv()).toThrow(/https/);
  });

  it("never allows demo credential UI hints", () => {
    Object.assign(process.env, {
      NODE_ENV: "development",
      NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS: "true",
      ALLOW_DEMO_CREDENTIALS: "true",
      DATABASE_URL: "file:./dev.db",
      AUTH_SECRET: "dev-only-secret",
    });
    expect(allowDemoCredentials()).toBe(false);

    Object.assign(process.env, {
      APP_ENV: "production",
      NODE_ENV: "production",
      DATABASE_URL:
        "postgresql://user:pass@db.example:5432/nivaro?sslmode=require",
      AUTH_SECRET: "a".repeat(40),
      AUTH_URL: "https://app.example.com",
    });
    getEnv();
    expect(allowDemoCredentials()).toBe(false);
  });
});

