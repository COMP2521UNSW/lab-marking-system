import '@@/env-config';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { sql } from 'drizzle-orm';
import toml from 'smol-toml';
import z, { ZodError } from 'zod';

import { activitiesTable, db } from '@/db/db';
import { logger } from '@/lib/logger';

import { parseError } from './utils';

const activitySchema = z.object({
	code: z.string(),
	name: z.string(),
	ordering: z.int().optional(),
	smsName: z.string().optional(),
	maxMark: z.int(),
	startWeek: z.int(),
	endWeek: z.int(),
});

const configSchema = z.object({
	activities: z.array(activitySchema),
});

type Activity = z.infer<typeof activitySchema>;

async function main() {
	const file = path.join(__dirname, 'activities.toml');

	if (!existsSync(file)) {
		logger.error('activities.toml does not exist');
		process.exit(1);
	}

	try {
		const tomlData = readFileSync(file, 'utf-8');

		const config = z.parse(configSchema, toml.parse(tomlData));

		await addActivities(config.activities);
	} catch (err) {
		if (err instanceof ZodError) {
			logger.error(
				'Invalid activities config: see activities.example.toml for an example',
			);
		} else {
			logger.error(parseError(err));
		}
		process.exit(1);
	}
}

async function addActivities(activities: Activity[]) {
	await db
		.insert(activitiesTable)
		.values(activities)
		.onConflictDoUpdate({
			target: activitiesTable.code,
			set: {
				name: sql`excluded.name`,
				ordering: sql`excluded.ordering`,
				smsName: sql`excluded."smsName"`,
				maxMark: sql`excluded."maxMark"`,
				startWeek: sql`excluded."startWeek"`,
				endWeek: sql`excluded."endWeek"`,
			},
		});
}

void main();
