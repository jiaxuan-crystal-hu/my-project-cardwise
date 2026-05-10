import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Use your card wallet, then get category-based recommendations (cashback
          and points tracks).
        </p>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-medium">Quick links</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-400">
          <li>
            <Link
              href="/dashboard/wallet"
              className="text-emerald-400 hover:underline"
            >
              Card wallet
            </Link>{" "}
            — add the cards you carry.
          </li>
          <li>
            <Link
              href="/dashboard/recommend"
              className="text-emerald-400 hover:underline"
            >
              Recommend
            </Link>{" "}
            — pick a category and optional amount.
          </li>
        </ul>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Marketing home
        </Link>
      </section>
    </div>
  );
}
