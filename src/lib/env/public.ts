/**
 * Public env checks (safe on server and inlined for client where NEXT_PUBLIC_* is used).
 * Trims whitespace so pasted keys with accidental spaces still work.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

/** PostHog public key present (browser and server; only init/capture in the client). */
export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

/** US cloud default: https://us.i.posthog.com — set NEXT_PUBLIC_POSTHOG_HOST for EU or self-host. */
export function getPostHogApiHost(): string {
  const h = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  return h && h.length > 0 ? h : "https://us.i.posthog.com";
}
