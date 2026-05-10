import type { AppliedRewardPath } from "./get-applied-reward-rule";
import type { RewardRuleRow } from "@/types/reward-rules";

const NOTE_MAX = 160;

export function truncateNote(s: string, max = NOTE_MAX): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** One short clause for how the rule was selected (Task 9). */
export function matchPathCaption(path: AppliedRewardPath): string {
  switch (path) {
    case "internal":
      return "Category rule matched.";
    case "legacy_slug":
      return "Purchase label matched (legacy bucket).";
    case "fallback":
      return "Fallback rule (default earn).";
    default:
      return "";
  }
}

/** Append issuer seed notes when not redundant with the sentence. */
export function appendIssuerNote(
  sentence: string,
  rule: RewardRuleRow,
  max = NOTE_MAX,
): string {
  const n = rule.notes?.trim();
  if (!n) return sentence;
  if (sentence.includes(n)) return sentence;
  return `${sentence} Issuer note: ${truncateNote(n, max)}`;
}
