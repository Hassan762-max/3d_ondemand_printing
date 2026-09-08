/**
 * Outbound notification channel (email/SMS later).
 * Always safe for local: logs to console. In-app Notification rows stay primary.
 */

export type OutboundMessage = {
  to: string;
  subject: string;
  body: string;
  channel?: "email" | "sms";
};

export interface OutboundNotifier {
  readonly name: string;
  send(message: OutboundMessage): Promise<void>;
}

export class ConsoleOutboundNotifier implements OutboundNotifier {
  readonly name = "console";

  async send(message: OutboundMessage) {
    console.info(
      `[notify:${message.channel ?? "email"}] to=${message.to} · ${message.subject} — ${message.body.slice(0, 160)}`,
    );
  }
}

export class NoopOutboundNotifier implements OutboundNotifier {
  readonly name = "noop";
  async send() {}
}

export function getOutboundNotifier(): OutboundNotifier {
  const mode = (process.env.NOTIFY_PROVIDER || "console").toLowerCase();
  if (mode === "noop" || mode === "off") return new NoopOutboundNotifier();
  return new ConsoleOutboundNotifier();
}

export async function notifyOutbound(message: OutboundMessage) {
  try {
    await getOutboundNotifier().send(message);
  } catch (err) {
    console.warn("[notify] outbound failed", err);
  }
}
