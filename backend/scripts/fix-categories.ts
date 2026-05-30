/**
 * One-time migration script — fixes mismatched category names in the DB.
 *
 * Run ONCE with:
 *   npx ts-node backend/scripts/fix-categories.ts
 *
 * What it does:
 *   - Renames "Cups"           → "Mugs"
 *   - Renames "Custom Printed" → "Mugs"
 *
 * These were the old values saved by the previous admin form.
 * After running this, the category filter on the product listing page will work correctly.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RENAMES: { from: string; to: string }[] = [
  { from: 'Cups',           to: 'Mugs' },
  { from: 'Custom Printed', to: 'Mugs' },
];

async function main() {
  for (const { from, to } of RENAMES) {
    const result = await prisma.product.updateMany({
      where: { category: { equals: from, mode: 'insensitive' } },
      data:  { category: to },
    });
    console.log(`Renamed "${from}" → "${to}": ${result.count} product(s) updated`);
  }
  console.log('✅ Category migration complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
