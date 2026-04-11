import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.PGHOST || '127.0.0.1',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'romelife',
    user: process.env.PGUSER || 'romeuser',
    password: process.env.PGPASSWORD || 'romepass',
  },
});
