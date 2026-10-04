import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const pool = new Pool({ connectionString: process.env.DATABASE_URL,
 ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined });
const connection = await pool.connect();
try {
 await connection.query('BEGIN');
 await connection.query("SELECT pg_advisory_xact_lock(hashtext('account-schema-v1'))");
 await connection.query(await readFile(new URL('../migrations/schema.sql', import.meta.url), 'utf8'));
 await connection.query('COMMIT');
} catch { await connection.query('ROLLBACK'); throw new Error('Account migration failed'); }
finally { connection.release(); await pool.end(); }
