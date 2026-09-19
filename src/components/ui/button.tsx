import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariants = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

function buttonClassName({
  className,
  variant = "primary",
  size = "md",
}: ButtonVariants & { className?: string }) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
    variant === "primary" &&
      "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)]",
    variant === "secondary" &&
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-bright)]",
    variant === "outline" &&
      "border border-[var(--ink)]/15 bg-transparent text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]",
    variant === "ghost" &&
      "bg-transparent text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]",
    size === "sm" && "h-9 px-3.5 text-sm rounded-md",
    size === "md" && "h-11 px-5 text-sm rounded-md",
    size === "lg" && "h-12 px-7 text-base rounded-lg",
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    href?: never;
  };

type ButtonLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "className"
> &
  ButtonVariants & {
    className?: string;
    href: string;
  };

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { className, variant = "primary", size = "md" } = props;
  const classes = buttonClassName({ className, variant, size });

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, ...linkProps } = props;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    ...buttonProps
  } = props as ButtonProps;
  return <button className={classes} {...buttonProps} />;
}
