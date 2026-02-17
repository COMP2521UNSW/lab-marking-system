import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig(
	process.env.DB_FILE_NAME
		? // SQLite
			{
				dialect: 'sqlite',
				schema: './src/db/dialects/sqlite/schema.ts',
				out: './drizzle',
				dbCredentials: {
					url: process.env.DB_FILE_NAME,
				},
			}
		: // PostgreSQL
			{
				dialect: 'postgresql',
				schema: './src/db/dialects/pg/schema.ts',
				out: './drizzle',
				dbCredentials: {
					url: process.env.DATABASE_URL!,
				},
			},
);
