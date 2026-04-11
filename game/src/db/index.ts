import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'romelife',
  user: process.env.PGUSER || 'romeuser',
  password: process.env.PGPASSWORD || 'romepass',
  max: 10,
});

export const db = drizzle(pool, { schema });
export { schema };
