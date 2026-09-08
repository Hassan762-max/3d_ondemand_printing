"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  settleVendorOrder,
  setUserActive,
  setUserRole,
  toggleProductActive,
  collectCodRemaining,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ToggleProductButton({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "outline" : "secondary"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await toggleProductActive(productId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}

export function SettleOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await settleVendorOrder(orderId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Settle vendor"}
    </Button>
  );
}

export function CollectCodButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await collectCodRemaining(orderId);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Collect COD"}
    </Button>
  );
}

const ASSIGNABLE_ROLES = [
  "CUSTOMER",
  "DESIGNER",
  "VENDOR",
  "PRODUCTION_MANAGER",
  "QC_MANAGER",
  "SUPPORT_MANAGER",
  "FINANCE_MANAGER",
  "ADMIN",
] as const;

export function SetUserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <select
      value={currentRole}
      disabled={pending || currentRole === "SUPER_ADMIN"}
      onChange={(e) => {
        const role = e.target.value;
        start(async () => {
          await setUserRole(userId, role);
          router.refresh();
        });
      }}
      className="h-9 rounded-md border border-[var(--ink)]/12 bg-white/80 px-2 text-xs"
    >
      {currentRole === "SUPER_ADMIN" ? (
        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
      ) : (
        ASSIGNABLE_ROLES.map((role) => (
          <option key={role} value={role}>
            {role.replaceAll("_", " ")}
          </option>
        ))
      )}
    </select>
  );
}

export function ToggleUserActiveButton({
  userId,
  active,
}: {
  userId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "outline" : "secondary"}
      disabled={pending}
      onClick={() => {
        start(async () => {
          await setUserActive(userId, !active);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}
