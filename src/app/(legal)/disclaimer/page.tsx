import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer — CardWise",
  description: "Product disclaimer: estimates only, not financial advice.",
};

export default function DisclaimerPage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
        Product disclaimer
      </h1>
      <p className="text-zinc-500">Last updated: April 2026</p>

      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100/95">
        <strong className="text-amber-50">Not financial advice.</strong>{" "}
        CardWise is for education and general comparison only. It is not
        financial, tax, or legal advice, and is not a recommendation to apply
        for, keep, or cancel any product.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Estimates only</h2>
        <p>
          Dollar and point values shown in the app are{" "}
          <strong>rough, illustrative estimates</strong> based on the reward
          rules and assumptions we have loaded. Real rewards depend on issuer
          terms, how you pay, category coding by the merchant, caps, and other
          factors the MVP does not model. Actual earnings may be higher, lower, or
          zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">No bank access</h2>
        <p>
          The MVP <strong>does not</strong> connect to your bank, cards, or
          statements. It cannot see where you really shop, how much you spend,
          or whether a purchase actually earned rewards. You are responsible for
          confirming rewards with your issuer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-zinc-100">Your responsibility</h2>
        <p>
          You choose which card to use at checkout. CardWise does not make that
          decision for you and is not responsible for any financial outcome, fee,
          or missed rewards.
        </p>
      </section>

      <p className="pt-2 text-xs text-zinc-500">
        <Link href="/terms" className="text-emerald-500/90 hover:underline">
          Terms
        </Link>
        {" · "}
        <Link href="/privacy" className="text-emerald-500/90 hover:underline">
          Privacy
        </Link>
      </p>
    </article>
  );
}
