import 'dotenv/config';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { sql } from 'drizzle-orm';
import toml from 'smol-toml';
import z, { ZodError } from 'zod';

import { db, usersTable } from '@/db/db';
import { logger } from '@/lib/logger';

import { parseError } from './utils';

const userSchema = z.object({
	zid: z.string(),
	name: z.string(),
});

const staffSchema = z.object({
	admins: z.array(userSchema),
	tutors: z.array(userSchema),
});

type User = z.infer<typeof userSchema>;

async function main() {
	const file = path.join(__dirname, 'staff.toml');

	if (!existsSync(file)) {
		logger.error('staff.toml does not exist');
		process.exit(1);
	}

	try {
		const tomlData = readFileSync(file, 'utf-8');

		const staff = z.parse(staffSchema, toml.parse(tomlData));

		// add tutors first so that any tutors who are also admins will have their
		// role overwritten by 'admin'
		await addStaff(staff.tutors, 'tutor');
		await addStaff(staff.admins, 'admin');
	} catch (err) {
		if (err instanceof ZodError) {
			logger.error(
				'Invalid staff config: see staff.example.toml for an example',
			);
		} else {
			logger.error(parseError(err));
		}
		process.exit(1);
	}
}

async function addStaff(users: User[], role: 'tutor' | 'admin') {
	await db
		.insert(usersTable)
		.values(
			users.map((user) => ({
				...user,
				role,
			})),
		)
		.onConflictDoUpdate({
			target: usersTable.zid,
			set: {
				name: sql`excluded.name`,
				role: sql`excluded.role`,
			},
		});
}

void main();
