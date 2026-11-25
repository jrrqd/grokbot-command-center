"use client";

import dynamic from "next/dynamic";

const CommandCenter = dynamic(() => import("@/components/CommandCenter"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center text-muted text-sm">
      Loading mission control…
    </div>
  ),
});

export default function Home() {
  return <CommandCenter />;
}