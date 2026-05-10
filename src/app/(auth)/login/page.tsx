import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { LoginForm } from "@/app/(auth)/login-form";
import { isSupabaseConfigured } from "@/lib/env/public";

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabaseReady = isSupabaseConfigured();
  const next = params.next ?? "/dashboard";
  const authError =
    params.error === "auth"
      ? "Email link failed or expired. Try logging in again."
      : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Use the email and password you registered with Supabase Auth.
      </p>
      {authError ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {authError}
        </p>
      ) : null}
      {!supabaseReady ? (
        <div
          className="mt-4 rounded-md border border-amber-700/80 bg-amber-950/40 p-4 text-sm text-amber-100"
          role="alert"
        >
          <p className="font-medium">Supabase environment variables are not loaded.</p>
          <p className="mt-2 text-amber-100/90">
            Create <code className="text-amber-50">.env.local</code> in the{" "}
            <strong>project root</strong> (same folder as{" "}
            <code className="text-amber-50">package.json</code>), add{" "}
            <code className="text-amber-50">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-amber-50">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            with your project values (no quotes). Then stop the dev server and run{" "}
            <code className="text-amber-50">npm run dev</code> again—Next only reads
            env files on startup.
          </p>
        </div>
      ) : (
        <LoginForm action={signIn} nextPath={next} />
      )}
      <p className="mt-4 text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
