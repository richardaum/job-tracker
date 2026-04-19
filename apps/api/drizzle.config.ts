import type { Config } from 'drizzle-kit';
import { DATABASE_URL } from './src/env/server';

export default {
  dialect: 'postgresql',
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
