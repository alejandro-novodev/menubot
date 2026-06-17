import { config } from 'dotenv';
config({ path: '.env.local' });

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Runs every .sql file in db/migrations in filename order.
 * Migrations must be idempotent (use IF NOT EXISTS); re-running is safe.
 *   npm run migrate
 */
(async () => {
  const { query } = await import('../lib/db');
  const dir = join(process.cwd(), 'db', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('No migrations found.');
    process.exit(0);
  }

  for (const file of files) {
    const sql = readFileSync(join(dir, file), 'utf-8');
    process.stdout.write(`Running ${file} … `);
    try {
      await query(sql);
      console.log('ok');
    } catch (e) {
      console.error('FAILED');
      console.error(e);
      process.exit(1);
    }
  }

  console.log(`Done — ${files.length} migration(s) applied.`);
  process.exit(0);
})();
