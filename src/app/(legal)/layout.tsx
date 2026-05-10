import type { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="mb-8 text-sm text-zinc-500">
          <Link
            href="/"
            className="text-emerald-400 hover:text-emerald-300"
          >
            ← Home
          </Link>
        </p>
        {children}
      </div>
    </div>
  );
}
