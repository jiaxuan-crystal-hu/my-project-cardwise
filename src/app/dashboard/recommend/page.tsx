import { RecommendClient } from "@/app/dashboard/recommend/recommend-client";

export default function RecommendPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recommend a card</h1>
        <p className="mt-1 text-sm text-zinc-400">
          We compare the cards in your wallet using the reward rules in your database.
          Choose a category; amounts are optional and help with dollar and point
          estimates.
        </p>
      </div>
      <RecommendClient />
    </div>
  );
}
