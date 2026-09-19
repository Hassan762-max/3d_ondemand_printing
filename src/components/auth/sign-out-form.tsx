"use client";

import type { ReactNode } from "react";
import { clearAuthLifetimeClientState } from "@/lib/auth/session-lifetime";

type SignOutFormProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Clears browser-lifetime markers, then hard-navigates to the end-session
 * route (avoids Server Action + Auth.js redirect "unexpected response" errors).
 */
export function SignOutForm({ className, children }: SignOutFormProps) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        clearAuthLifetimeClientState();
        window.location.assign("/auth/end-session");
      }}
    >
      {children}
    </form>
  );
}
