"use client";

import type { AuthActionState } from "@/app/(auth)/actions";
import { captureEvent } from "@/lib/analytics/posthog-client";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-md bg-emerald-500 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
    >
      {pending ? "Please wait…" : "Create account"}
    </button>
  );
}

export function SignupForm({ action }: Props) {
  const [state, formAction] = useActionState(action, null);
  const didCaptureSignup = useRef(false);

  useEffect(() => {
    if (!state || !("success" in state) || didCaptureSignup.current) {
      return;
    }
    didCaptureSignup.current = true;
    captureEvent("signup_completed", { source: "email_signup_form" });
  }, [state]);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <div>
        <label htmlFor="email" className="block text-sm text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-2"
        />
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-emerald-300" role="status">
          {state.success}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
