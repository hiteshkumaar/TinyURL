// migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // for local Postgres you may not need ssl
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      run_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const files = fs.readdirSync(path.join(__dirname, 'migrations'))
                    .filter(f => f.endsWith('.sql'))
                    .sort();

    for (const file of files) {
      const id = file;
      const existsRes = await client.query('SELECT 1 FROM migrations WHERE id=$1', [id]);
      if (existsRes.rowCount > 0) {
        console.log(`Skipping ${id} (already run)`);
        continue;
      }
      console.log(`Running migration: ${id}`);
      const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations(id) VALUES($1)', [id]);
        await client.query('COMMIT');
        console.log(`Migration ${id} OK`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('All migrations finished');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
