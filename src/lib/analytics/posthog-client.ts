import posthog from "posthog-js";
import { getPostHogApiHost, isPostHogConfigured } from "@/lib/env/public";

let initialized = false;

/**
 * One-time init for browser analytics. No-op if env key is missing.
 * Safe to call from any client event after init; guarded by `initialized`.
 */
export function initPostHog(): void {
  if (typeof window === "undefined") return;
  if (initialized) return;
  if (!isPostHogConfigured()) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;
  posthog.init(key, {
    api_host: getPostHogApiHost(),
    person_profiles: "identified_only",
    // Named events only for MVP funnel; avoid duplicate SPA + full reload noise.
    capture_pageview: false,
  });
  initialized = true;
}

export function captureEvent(
  name: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;
  if (!isPostHogConfigured()) return;
  initPostHog();
  if (!initialized) return;
  posthog.capture(name, { ...properties });
}

export function identifyPostHogUser(
  distinctId: string,
  properties?: Record<string, string | null | undefined>,
): void {
  if (typeof window === "undefined") return;
  if (!isPostHogConfigured()) return;
  initPostHog();
  if (!initialized) return;
  posthog.identify(distinctId, properties);
}
