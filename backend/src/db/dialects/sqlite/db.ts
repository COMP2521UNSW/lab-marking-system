import { drizzle } from 'drizzle-orm/libsql';

export { alias } from 'drizzle-orm/sqlite-core';
export * from './schema';
export const db = drizzle(process.env.DB_FILE_NAME!);
