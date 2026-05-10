import { WalletClient } from "@/app/dashboard/wallet/wallet-client";

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Card wallet</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Search the catalog and add cards you carry. Nothing here is linked to
          your bank—only which products you want recommendations for.
        </p>
      </div>
      <WalletClient />
    </div>
  );
}
