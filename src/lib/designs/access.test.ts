import { describe, expect, it } from "vitest";
import {
  designsAvailableToUser,
  userCanUseDesign,
} from "@/lib/designs/access";

describe("designsAvailableToUser — query shape", () => {
  it("limits anonymous users to library designs", () => {
    expect(designsAvailableToUser(undefined)).toEqual({ isLibrary: true });
  });

  it("opens owned, licensed, saved, and library designs for signed-in users", () => {
    const where = designsAvailableToUser("user_123");
    expect(where).toEqual({
      OR: [
        { isLibrary: true },
        { ownerId: "user_123" },
        {
          published: true,
          moderationStatus: "approved",
          licenses: { some: { buyerId: "user_123" } },
        },
        { savedBy: { some: { userId: "user_123" } } },
      ],
    });
  });
});

describe("userCanUseDesign — access checks with fake prisma", () => {
  it("allows library and owned designs without a license lookup", async () => {
    const prisma = {
      design: {
        findUnique: async () => ({
          id: "d1",
          isLibrary: true,
          ownerId: "other",
        }),
      },
      designLicense: {
        findFirst: async () => {
          throw new Error("should not query license for library designs");
        },
      },
    };
    await expect(userCanUseDesign(prisma, "d1", "user_123")).resolves.toMatchObject({
      ok: true,
    });

    prisma.design.findUnique = async () => ({
      id: "d2",
      isLibrary: false,
      ownerId: "user_123",
    });
    await expect(userCanUseDesign(prisma, "d2", "user_123")).resolves.toMatchObject({
      ok: true,
    });
  });

  it("allows licensed designs and rejects others", async () => {
    const prisma = {
      design: {
        findUnique: async () => ({
          id: "d3",
          isLibrary: false,
          ownerId: "owner",
        }),
      },
      designLicense: {
        findFirst: async () => ({ id: "lic1" }),
      },
    };
    await expect(userCanUseDesign(prisma, "d3", "buyer")).resolves.toMatchObject({
      ok: true,
    });

    prisma.designLicense.findFirst = async () => null as unknown as { id: string };
    await expect(userCanUseDesign(prisma, "d3", "buyer")).resolves.toMatchObject({
      ok: false,
    });
  });

  it("rejects missing designs", async () => {
    const prisma = {
      design: { findUnique: async () => null },
      designLicense: { findFirst: async () => null },
    };
    await expect(userCanUseDesign(prisma, "missing", "user")).resolves.toEqual({
      ok: false,
      design: null,
    });
  });
});
