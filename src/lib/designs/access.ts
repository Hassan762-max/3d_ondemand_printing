/** Shared design query helper — library, owned, or licensed. */
export function designsAvailableToUser(userId: string | undefined) {
  if (!userId) {
    return { isLibrary: true as const };
  }
  return {
    OR: [
      { isLibrary: true },
      { ownerId: userId },
      {
        published: true,
        moderationStatus: "approved" as const,
        licenses: { some: { buyerId: userId } },
      },
      { savedBy: { some: { userId } } },
    ],
  };
}

export async function userCanUseDesign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  designId: string,
  userId: string,
) {
  const design = await prisma.design.findUnique({ where: { id: designId } });
  if (!design) return { ok: false as const, design: null };
  if (design.isLibrary || design.ownerId === userId) {
    return { ok: true as const, design };
  }
  const license = await prisma.designLicense.findFirst({
    where: { designId, buyerId: userId },
  });
  if (license) return { ok: true as const, design };
  return { ok: false as const, design };
}
