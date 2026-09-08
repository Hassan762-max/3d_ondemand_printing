"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthorizedUser, requireUser } from "@/lib/session";

export type SupportActionResult = { ok: boolean; message?: string };

const ticketSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().min(4).max(120),
  body: z.string().min(10).max(2000),
  orderId: z.string().optional(),
});

export async function submitSupportTicket(
  _prev: SupportActionResult,
  formData: FormData,
): Promise<SupportActionResult> {
  const sessionUser = await getAuthorizedUser();

  const parsed = ticketSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    orderId: String(formData.get("orderId") || "").trim() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please complete all fields with a clear message." };
  }

  let orderId: string | undefined;
  if (parsed.data.orderId && sessionUser) {
    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: sessionUser.id },
      select: { id: true },
    });
    orderId = order?.id;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: sessionUser?.id,
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      subject: parsed.data.subject,
      body: parsed.data.body,
      orderId,
      status: "open",
    },
  });

  const supportUsers = await prisma.user.findMany({
    where: { role: { in: ["SUPPORT_MANAGER", "ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
    take: 20,
  });

  if (supportUsers.length > 0) {
    await prisma.notification.createMany({
      data: supportUsers.map((u) => ({
        userId: u.id,
        title: "New support ticket",
        body: `${parsed.data.subject} — ${parsed.data.email}`,
        href: "/ops",
      })),
    });
  }

  if (sessionUser) {
    await prisma.notification.create({
      data: {
        userId: sessionUser.id,
        title: "Support request received",
        body: `We received “${parsed.data.subject}”. Ops will follow up in-app.`,
        href: "/account/notifications",
      },
    });
  }

  revalidatePath("/ops");
  revalidatePath("/support/contact");
  revalidatePath("/account/notifications");
  return {
    ok: true,
    message: `Ticket submitted (${ticket.id.slice(0, 8)}). Check notifications for updates.`,
  };
}

export async function resolveSupportTicket(
  _prev: SupportActionResult,
  formData: FormData,
): Promise<SupportActionResult> {
  const user = await requireUser("support:manage");
  const ticketId = String(formData.get("ticketId") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 400);
  const status = String(formData.get("status") || "closed");
  if (!ticketId) return { ok: false, message: "Missing ticket." };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, message: "Ticket not found." };

  const nextStatus = status === "open" ? "open" : "closed";
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: nextStatus, note: note || ticket.note },
  });

  if (ticket.userId) {
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: nextStatus === "closed" ? "Support ticket closed" : "Support ticket updated",
        body: note || `Your ticket “${ticket.subject}” is now ${nextStatus}.`,
        href: "/support/contact",
      },
    });
  }

  revalidatePath("/ops");
  revalidatePath("/account/notifications");
  return { ok: true, message: `Ticket marked ${nextStatus}.` };
}
