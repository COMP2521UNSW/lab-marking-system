import path from 'node:path';

import { drizzle } from 'drizzle-orm/libsql';

import { rootDir } from '@@/path-config';

export { like as ilike } from 'drizzle-orm';
export { alias } from 'drizzle-orm/sqlite-core';
export * from './schema';
export const db = drizzle(
	`file:${path.join(rootDir, process.env.DB_FILE_NAME!)}`,
);
