import { signOut } from "@/app/(auth)/actions";
import { PostHogIdentify } from "@/components/posthog-identify";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <PostHogIdentify userId={user.id} email={user.email ?? null} />
      <header className="border-b border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-6 py-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-zinc-300 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/dashboard/wallet"
              className="text-zinc-300 hover:text-white"
            >
              Card wallet
            </Link>
            <Link
              href="/dashboard/recommend"
              className="text-zinc-300 hover:text-white"
            >
              Recommend
            </Link>
          </nav>
          <span className="ml-auto hidden text-xs text-zinc-500 sm:inline">
            {user.email}
          </span>
          <form action={signOut} className="ml-auto sm:ml-0">
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
      <footer className="border-t border-zinc-800 py-6">
        <div className="mx-auto max-w-3xl px-6">
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
            <Link
              href="/terms"
              className="text-zinc-500 hover:text-zinc-300"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-zinc-500 hover:text-zinc-300"
            >
              Privacy
            </Link>
            <Link
              href="/disclaimer"
              className="text-zinc-500 hover:text-zinc-300"
            >
              Disclaimer
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
