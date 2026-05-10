"use client";

import {
  PURCHASE_CATEGORIES,
  PURCHASE_CATEGORY_LABELS,
  type PurchaseCategoryId,
} from "@/constants/categories";
import { CATALOG_SLUGS } from "@/data/catalog/task4-card-seeds";
import { captureEvent } from "@/lib/analytics/posthog-client";
import type { CardRow, WalletEntry } from "@/types/cards";
import { useCallback, useEffect, useMemo, useState } from "react";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = {
  ok: false;
  error: { code: string; message: string };
};

type CardsPayload = { cards: CardRow[] };
type WalletPayload = { entries: WalletEntry[] };

async function parseApi<T>(res: Response): Promise<ApiOk<T> | ApiErr> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      error: {
        code: "invalid_response",
        message: "Could not read JSON from the server.",
      },
    };
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
  if (
    typeof body === "object" &&
    body !== null &&
    "ok" in body &&
    body.ok === true &&
    "data" in body
  ) {
    return body as ApiOk<T>;
  }
  return {
    ok: false,
    error: { code: "parse_error", message: "Unexpected API response" },
  };
}

export function WalletClient() {
  const [wallet, setWallet] = useState<WalletEntry[]>([]);
  const [catalog, setCatalog] = useState<CardRow[]>([]);
  const [query, setQuery] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyCcTop, setBusyCcTop] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const savedCardIds = useMemo(
    () => new Set(wallet.map((w) => w.card.id)),
    [wallet],
  );

  const loadWallet = useCallback(async (): Promise<WalletEntry[] | null> => {
    setLoadingWallet(true);
    setError(null);
    const res = await fetch("/api/user/cards", { credentials: "same-origin" });
    if (res.status === 401) {
      window.location.href = "/login";
      return null;
    }
    const parsed = await parseApi<WalletPayload>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setLoadingWallet(false);
      return null;
    }
    setWallet(parsed.data.entries);
    setLoadingWallet(false);
    return parsed.data.entries;
  }, []);

  const loadCatalog = useCallback(async (q: string) => {
    setLoadingCatalog(true);
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/cards?${params.toString()}`, {
      credentials: "same-origin",
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const parsed = await parseApi<CardsPayload>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setCatalog([]);
      setLoadingCatalog(false);
      return;
    }
    setCatalog(parsed.data.cards);
    setLoadingCatalog(false);
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    const delay = query.trim() === "" ? 0 : 280;
    const t = window.setTimeout(() => {
      void loadCatalog(query);
    }, delay);
    return () => window.clearTimeout(t);
  }, [query, loadCatalog]);

  async function handleAdd(cardId: string) {
    const countBefore = wallet.length;
    setBusyId(cardId);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/user/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ cardId }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const parsed = await parseApi<{ added: boolean }>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setBusyId(null);
      return;
    }
    setMessage("Card added to your wallet.");
    setBusyId(null);
    const entries = await loadWallet();
    if (entries && entries.length === 2 && countBefore === 1) {
      captureEvent("wallet_second_card_added", {
        method: "wallet_add",
      });
    }
  }

  async function patchCustomCashTop(
    userCardId: string,
    category: PurchaseCategoryId | null,
  ) {
    setBusyCcTop(userCardId);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/user/cards/${userCardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ customCashTopCategory: category }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const parsed = await parseApi<{ updated: boolean }>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setBusyCcTop(null);
      return;
    }
    setMessage("Custom Cash top category updated.");
    setBusyCcTop(null);
    await loadWallet();
  }

  async function handleRemove(userCardId: string) {
    setBusyId(userCardId);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/user/cards/${userCardId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const parsed = await parseApi<{ removed: boolean }>(res);
    if (!parsed.ok) {
      setError(parsed.error.message);
      setBusyId(null);
      return;
    }
    setMessage("Removed from wallet.");
    setBusyId(null);
    await loadWallet();
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-400" role="status">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-lg font-medium">Your cards</h2>
        {loadingWallet ? (
          <p className="mt-3 text-sm text-zinc-500">Loading…</p>
        ) : wallet.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No cards yet. Add at least two from the catalog for MVP onboarding
            goals.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-800">
            {wallet.map((row) => (
              <li
                key={row.userCardId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-zinc-100">{row.card.name}</p>
                  <p className="text-xs text-zinc-500">
                    {row.card.issuer} · {row.card.card_type}
                    {row.card.network ? ` · ${row.card.network}` : ""}
                  </p>
                  {row.card.id === CATALOG_SLUGS.citiCustomCash ? (
                    <label className="block max-w-xs">
                      <span className="mb-1 block text-xs text-zinc-400">
                        Custom Cash 5% bucket (your selection)
                      </span>
                      <select
                        value={row.customCashTopCategory ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          void patchCustomCashTop(
                            row.userCardId,
                            v === "" ? null : (v as PurchaseCategoryId),
                          );
                        }}
                        disabled={busyCcTop === row.userCardId}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 outline-none ring-emerald-500/30 focus:ring-2 disabled:opacity-50"
                      >
                        <option value="">Not set — compare at 1%</option>
                        {PURCHASE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {PURCHASE_CATEGORY_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(row.userCardId)}
                  disabled={busyId === row.userCardId}
                  className="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-400 disabled:opacity-50"
                >
                  {busyId === row.userCardId ? "…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-lg font-medium">Add from catalog</h2>
        <label className="mt-3 block text-sm text-zinc-400" htmlFor="card-search">
          Search by card name
        </label>
        <input
          id="card-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Sapphire, Gold, Blue Cash"
          className="mt-1 w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-2"
        />
        {loadingCatalog ? (
          <p className="mt-4 text-sm text-zinc-500">Searching…</p>
        ) : (
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {catalog.map((card) => {
              const already = savedCardIds.has(card.id);
              return (
                <li
                  key={card.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{card.name}</p>
                    <p className="text-xs text-zinc-500">{card.issuer}</p>
                  </div>
                  <button
                    type="button"
                    disabled={already || busyId === card.id}
                    onClick={() => void handleAdd(card.id)}
                    className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {already ? "Added" : busyId === card.id ? "…" : "Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
