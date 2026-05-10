"use client";

import { initPostHog } from "@/lib/analytics/posthog-client";
import { isPostHogConfigured } from "@/lib/env/public";
import { useEffect } from "react";

/**
 * Mount once under the app root to initialize PostHog in the browser when keys are set.
 */
export function PostHogInitializer() {
  useEffect(() => {
    if (!isPostHogConfigured()) return;
    initPostHog();
  }, []);
  return null;
}
