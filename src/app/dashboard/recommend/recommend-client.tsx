"use client";

import {
  PURCHASE_CATEGORIES,
  PURCHASE_CATEGORY_LABELS,
} from "@/constants/categories";
import { captureEvent } from "@/lib/analytics/posthog-client";
import type { RecommendationResult } from "@/types/recommendation";
import { useState } from "react";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = {
  ok: false;
  error: { code: string; message: string };
};

type RecommendPayload = {
  result: RecommendationResult;
  amountUsed: number;
  category: string;
};

async function readApi<T>(res: Response): Promise<ApiOk<T> | ApiErr> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      error: { code: "parse", message: "Could not read response JSON" },
    };
  }
  if (
    typeof body === "object" &&
    body !== null &&
    "ok" in body &&
    body.ok === true &&
    "data" in body
  ) {
    return body as ApiOk<T>;
  }
  if (
    typeof body === "object" &&
    body !== null &&
    "ok" in body &&
    body.ok === false &&
    "error" in body
  ) {
    return body as ApiErr;
  }
  return {
    ok: false,
    error: { code: "unknown", message: "Unexpected response shape" },
  };
}

export function RecommendClient() {
  const [category, setCategory] = useState<string>(PURCHASE_CATEGORIES[0] ?? "dining");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendPayload | null>(null);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [historyBusy, setHistoryBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setData(null);
    setHistoryMessage(null);

    const n = amount.trim() === "" ? undefined : Number(amount);
    if (amount.trim() !== "") {
      if (!Number.isFinite(n) || (n as number) <= 0) {
        setError(
          "Amount must be a positive number, or leave blank to compare at $100.",
        );
        setSubmitting(false);
        return;
      }
    }

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        category,
        amount: n,
      }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const parsed = await readApi<RecommendPayload>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setSubmitting(false);
      return;
    }
    setData(parsed.data);
    setSubmitting(false);
    captureEvent("recommend_run", { category: parsed.data.category });
  }

  async function logHistory(selectedCardId: "cashback" | "points") {
    if (!data) return;
    const c = data.result.cashback;
    const p = data.result.points;
    const recCash = c?.cardId;
    const recPts = p?.cardId;
    if (selectedCardId === "cashback" && !c) return;
    if (selectedCardId === "points" && !p) return;

    const cardId = selectedCardId === "cashback" ? c!.cardId : p!.cardId;
    setHistoryBusy(true);
    setHistoryMessage(null);

    const res = await fetch("/api/recommendation-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        purchaseCategory: data.category,
        purchaseAmount: data.amountUsed,
        selectedCardId: cardId,
        recommendedCashbackCardId: recCash ?? null,
        recommendedPointsCardId: recPts ?? null,
        estimatedCashSaved:
          selectedCardId === "cashback" ? c?.estimatedValue ?? null : null,
        estimatedPointsGained:
          selectedCardId === "points" ? p?.estimatedPoints ?? null : null,
      }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const out = await readApi<{ saved: boolean }>(res);
    setHistoryBusy(false);
    if (!out.ok) {
      setHistoryMessage(`Could not save: ${out.error.message}`);
      return;
    }
    setHistoryMessage("Saved to your history.");
    captureEvent("recommend_history_logged", { track: selectedCardId });
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <div>
          <label
            className="block text-sm text-zinc-400"
            htmlFor="category"
          >
            Purchase category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            {PURCHASE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PURCHASE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm text-zinc-400"
            htmlFor="amount"
          >
            Purchase amount (USD, optional)
          </label>
          <input
            id="amount"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="e.g. 120 (blank = use $100 for comparison)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {submitting ? "Running…" : "Get recommendation"}
        </button>
      </form>

      {data ? (
        <div className="space-y-6">
          <p className="text-xs text-zinc-500">
            Comparison uses{" "}
            <strong className="text-zinc-300">${data.amountUsed.toFixed(2)}</strong>{" "}
            for <strong className="text-zinc-300">{data.category}</strong>. All dollar
            and point values are <strong>estimates</strong> for the MVP, not
            financial advice.
          </p>
          {data.result.warnings.map((w) => (
            <p key={w} className="text-sm text-amber-200/90">
              {w}
            </p>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard
              title="Best cashback (among your cards)"
              empty="No matching cashback rule for this category in your wallet."
              track={data.result.cashback}
            />
            <ResultCard
              title="Best points (among your cards)"
              empty="No matching points rule for this category in your wallet."
              track={data.result.points}
            />
          </div>

          <p className="text-xs text-zinc-500">
            CardWise does not have access to your real transactions. You can log which
            card you used for analytics and future savings features.
          </p>

          {historyMessage ? (
            <p className="text-sm text-emerald-400" role="status">
              {historyMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {data.result.cashback ? (
              <button
                type="button"
                disabled={historyBusy}
                onClick={() => void logHistory("cashback")}
                className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
              >
                I used the cashback pick
              </button>
            ) : null}
            {data.result.points ? (
              <button
                type="button"
                disabled={historyBusy}
                onClick={() => void logHistory("points")}
                className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
              >
                I used the points pick
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultCard({
  title,
  empty,
  track,
}: {
  title: string;
  empty: string;
  track: RecommendationResult["cashback"] | RecommendationResult["points"];
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
      {!track ? (
        <p className="mt-2 text-sm text-zinc-500">{empty}</p>
      ) : track.kind === "cashback" ? (
        <div className="mt-2 space-y-1">
          <p className="text-lg font-semibold text-zinc-50">{track.cardName}</p>
          <p className="text-sm text-emerald-400">
            ≈ ${track.estimatedValue.toFixed(2)} back
          </p>
          <p className="text-sm text-zinc-400">{track.explanation}</p>
        </div>
      ) : (
        <div className="mt-2 space-y-1">
          <p className="text-lg font-semibold text-zinc-50">{track.cardName}</p>
          <p className="text-sm text-zinc-300">
            ≈ {track.estimatedPoints.toLocaleString()} points (~$
            {track.estimatedDollarValue.toFixed(2)} at default ¢/pt)
          </p>
          <p className="text-sm text-zinc-400">{track.explanation}</p>
        </div>
      )}
    </div>
  );
}
