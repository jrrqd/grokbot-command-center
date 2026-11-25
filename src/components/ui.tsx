"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ContentTone } from "@/lib/types";

const toneClass: Record<ContentTone | "danger", string> = {
  muted: "t-muted",
  warning: "t-warning",
  success: "t-success",
  wait: "t-wait",
  info: "t-info",
  danger: "t-danger",
};

export function Chip({
  children,
  tone = "muted",
  className,
  pulse,
}: {
  children: ReactNode;
  tone?: ContentTone | "danger";
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className={clsx("chip", toneClass[tone], pulse && "pulse-live", className)}>
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden />
      )}
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  glass = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={clsx(
        "rounded-[var(--radius)] border border-line p-4 sm:p-5",
        glass ? "glass" : "bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

const buttonVariants = {
  primary: "bg-accent text-[#041016] hover:brightness-110",
  ghost: "bg-transparent hover:bg-surface2 text-text",
  outline: "border border-line bg-surface hover:bg-surface2",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
} as const;

export function Button({
  children,
  variant = "outline",
  className,
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition",
        size === "sm" ? "text-xs px-2.5 py-1.5" : "text-sm px-3.5 py-2",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let frame: number;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const p = Math.min(1, (ts - start.current) / duration);
      setDisplay(Math.round(value * p));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span style={{ animation: "count-shimmer 0.3s ease" }}>{display}</span>;
}

export function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Panel className="relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent ?? "var(--accent)" }}
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
        <CountUp value={value} />
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Panel>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 h-12 w-12 rounded-full border border-dashed border-line flex items-center justify-center text-muted text-lg">
        ∅
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line glass pt-14"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-surface2"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}