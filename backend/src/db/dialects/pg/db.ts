import { drizzle } from 'drizzle-orm/node-postgres';

export { ilike } from 'drizzle-orm';
export { alias } from 'drizzle-orm/pg-core';
export * from './schema';
export const db = drizzle(process.env.DATABASE_URL!);
