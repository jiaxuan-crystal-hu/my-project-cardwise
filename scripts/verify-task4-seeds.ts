/**
 * Verify Task 4 catalog + Task 5 reward seeds in TypeScript (no database).
 *
 * Run: npm run db:verify-task4
 * Or:  npx tsx scripts/verify-task4-seeds.ts
 */
import { verifyTask4Seeds } from "../src/data/catalog/task4-seed-verify";

const { ok, lines } = verifyTask4Seeds();
for (const line of lines) {
  // eslint-disable-next-line no-console
  console.log(line);
}
process.exit(ok ? 0 : 1);
