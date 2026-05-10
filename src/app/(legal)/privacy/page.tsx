import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — CardWise",
  description: "How CardWise handles information (MVP).",
};

/**
 * High-level notice for MVP. Point to your real policy & DPA before production.
 */
export default function PrivacyPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
        Privacy
      </h1>
      <p className="text-zinc-500">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">What we do not do</h2>
        <p>
          CardWise does <strong>not</strong> link to your bank or card issuers
          in the MVP, does <strong>not</strong> store full card numbers, bank
          logins, or account credentials, and does <strong>not</strong> read your
          purchase history.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">
          What you provide
        </h2>
        <p>
          If you create an account, we rely on a hosted authentication provider
          (e.g. email for sign-in). You may add cards to a personal
          &quot;wallet&quot; from a catalog and run category-based
          recommendations. That activity is associated with your account to
          power the app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Product analytics</h2>
        <p>
          We may use privacy-conscious analytics to understand how the product
          is used (for example, whether recommendations run successfully). You
          can use the app without optional analytics if keys are not configured
          in your deployment. Check your build or team for which tools are
          enabled.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Your choices</h2>
        <p>
          You can sign out, stop using the service, or ask your project owner how
          to delete data held by the underlying auth and database services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Contact</h2>
        <p>
          For privacy questions, contact the person or team operating this
          deployment of CardWise. Before a public launch, replace this page with
          a jurisdiction-appropriate policy and your legal entity name.
        </p>
      </section>

      <p className="pt-2 text-xs text-zinc-500">
        <Link href="/terms" className="text-emerald-500/90 hover:underline">
          Terms
        </Link>
        {" · "}
        <Link href="/disclaimer" className="text-emerald-500/90 hover:underline">
          Disclaimer
        </Link>
      </p>
    </article>
  );
}
