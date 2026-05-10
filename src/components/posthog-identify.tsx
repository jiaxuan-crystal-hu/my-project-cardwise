"use client";

import { identifyPostHogUser } from "@/lib/analytics/posthog-client";
import { isPostHogConfigured } from "@/lib/env/public";
import { useEffect } from "react";

type Props = {
  userId: string;
  email: string | null;
};

/**
 * Binds the authenticated user to PostHog for funnel and retention analysis.
 */
export function PostHogIdentify({ userId, email }: Props) {
  useEffect(() => {
    if (!isPostHogConfigured()) return;
    identifyPostHogUser(userId, { email: email ?? "" });
  }, [userId, email]);
  return null;
}
