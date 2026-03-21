import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const databaseHost = process.env.DATABASE_HOST;
const databasePort = Number(process.env.DATABASE_PORT || 5432);
const databaseName = process.env.DATABASE_NAME;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;

const databaseSsl = String(process.env.DATABASE_SSL || '').toLowerCase();
const useSsl = databaseSsl === 'true' || databaseSsl === '1' || databaseSsl === 'require';

export const pool = new Pool({
  connectionString: databaseUrl || undefined,
  host: databaseUrl ? undefined : databaseHost,
  port: databaseUrl ? undefined : databasePort,
  database: databaseUrl ? undefined : databaseName,
  user: databaseUrl ? undefined : databaseUser,
  password: databaseUrl ? undefined : databasePassword,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DATABASE_CONN_TIMEOUT_MS || 10000),
  keepAlive: true,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>{
  const result = await pool.query(text, params);
  return { rows: result.rows as T[] };
}

