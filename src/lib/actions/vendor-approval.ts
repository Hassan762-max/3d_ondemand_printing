"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export type VendorReviewResult = {
  ok: boolean;
  message?: string;
};

export async function approveVendor(
  vendorId: string,
): Promise<VendorReviewResult> {
  const admin = await requireUser("vendor:manage");

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!vendor) return { ok: false, message: "Vendor not found." };
  if (vendor.approvalStatus === "APPROVED" && vendor.active) {
    return { ok: false, message: "Vendor is already approved." };
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      approvalStatus: "APPROVED",
      active: true,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "vendor.approve",
      entity: "Vendor",
      entityId: vendorId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: "Vendor account approved",
      body: `${vendor.businessName} is approved. You can now receive production jobs.`,
      href: "/vendor",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/vendor");
  revalidatePath("/vendor/profile");
  return { ok: true, message: "Vendor approved." };
}

export async function rejectVendor(
  vendorId: string,
): Promise<VendorReviewResult> {
  const admin = await requireUser("vendor:manage");

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });
  if (!vendor) return { ok: false, message: "Vendor not found." };
  if (vendor.approvalStatus === "REJECTED") {
    return { ok: false, message: "Vendor is already rejected." };
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      approvalStatus: "REJECTED",
      active: false,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "vendor.reject",
      entity: "Vendor",
      entityId: vendorId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      title: "Vendor application update",
      body: `${vendor.businessName} was not approved. Contact support if you need help.`,
      href: "/vendor",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/vendor");
  return { ok: true, message: "Vendor rejected." };
}
