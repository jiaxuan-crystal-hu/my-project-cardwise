import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — CardWise",
  description: "Terms of use for the CardWise web application (MVP).",
};

/**
 * Legalese minimized for MVP. Not a substitute for counsel; replace before wide launch.
 */
export default function TermsPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
        Terms of use
      </h1>
      <p className="text-zinc-500">Last updated: April 2026</p>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">The service</h2>
        <p>
          CardWise is an early-stage web tool that offers{" "}
          <strong className="text-zinc-200">illustrative</strong> information to
          help you think about which of{" "}
          <strong className="text-zinc-200">your</strong> saved cards may earn
          more cashback or points for a <strong>category you choose</strong>. It
          does <strong>not</strong> connect to your bank or card issuer, does
          not read your statements, and does <strong>not</strong> execute
          transactions for you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Not advice</h2>
        <p>
          CardWise is <strong>not</strong> financial, tax, or legal advice.
          Card terms change; issuer rules, caps, and annual fees apply. You are
          responsible for your own decisions and for complying with your card
          agreements and applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Data & accounts</h2>
        <p>
          We use a third-party host for authentication and data storage. You
          are responsible for your account security and the accuracy of any
          cards you add to your wallet. See the{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            privacy policy
          </Link>{" "}
          for how we may handle information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Disclaimer</h2>
        <p>
          The app is provided &quot;as is&quot; without warranties. To the
          maximum extent allowed by law, we are not liable for losses or
          decisions you make after using the app. See the{" "}
          <Link href="/disclaimer" className="text-emerald-400 hover:underline">
            product disclaimer
          </Link>{" "}
          for more detail.
        </p>
      </section>

      <p className="pt-2 text-xs text-zinc-500">
        <Link href="/privacy" className="text-emerald-500/90 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/disclaimer" className="text-emerald-500/90 hover:underline">
          Disclaimer
        </Link>
      </p>
    </article>
  );
}
