import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { SignupForm } from "@/app/(auth)/signup-form";
import { isSupabaseConfigured } from "@/lib/env/public";

export default function SignupPage() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Create an account. If email confirmation is enabled in Supabase, you
        will need to verify before logging in.
      </p>
      {!supabaseReady ? (
        <div
          className="mt-4 rounded-md border border-amber-700/80 bg-amber-950/40 p-4 text-sm text-amber-100"
          role="alert"
        >
          <p className="font-medium">Supabase environment variables are not loaded.</p>
          <p className="mt-2 text-amber-100/90">
            Add <code className="text-amber-50">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-amber-50">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="text-amber-50">.env.local</code> at the repo root, then
            restart <code className="text-amber-50">npm run dev</code>.
          </p>
        </div>
      ) : (
        <SignupForm action={signUp} />
      )}
      <p className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
