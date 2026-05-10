import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">CardWise</h1>
        <p className="mt-2 text-zinc-400">
          Explainable card recommendations for cashback and points—no bank
          linking in MVP.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
        >
          Sign up
        </Link>
      </div>
      <p className="text-xs text-zinc-500">
        Product specs live in <code className="text-zinc-400">docs/</code>.
        Agent context: <code className="text-zinc-400">AGENTS.md</code>.
      </p>
      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-500">
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/terms" className="text-zinc-400 hover:text-zinc-200">
            Terms
          </Link>
          <Link href="/privacy" className="text-zinc-400 hover:text-zinc-200">
            Privacy
          </Link>
          <Link href="/disclaimer" className="text-zinc-400 hover:text-zinc-200">
            Disclaimer
          </Link>
        </nav>
        <p className="mt-2 max-w-prose text-zinc-600">
          Estimates only; not financial advice. No bank or issuer access in MVP.
        </p>
      </footer>
    </main>
  );
}
