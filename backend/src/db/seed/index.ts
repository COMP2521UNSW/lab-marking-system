import '@@/env-config';

import chalk from 'chalk';

import {
	activitiesTable,
	classesTable,
	db,
	settingsTable,
	usersTable,
} from '@/db/db';

import { fakeActivities, fakeClasses, fakeSettings, fakeUsers } from './data';

const BATCH_SIZE = 1000;

async function main() {
	await db.insert(settingsTable).values(fakeSettings).onConflictDoNothing();

	for (let i = 0; i < fakeActivities.length; i += BATCH_SIZE) {
		await db
			.insert(activitiesTable)
			.values(fakeActivities.slice(i, i + BATCH_SIZE))
			.onConflictDoNothing();
	}

	for (let i = 0; i < fakeClasses.length; i += BATCH_SIZE) {
		await db
			.insert(classesTable)
			.values(fakeClasses.slice(i, i + BATCH_SIZE))
			.onConflictDoNothing();
	}

	for (let i = 0; i < fakeUsers.length; i += BATCH_SIZE) {
		await db
			.insert(usersTable)
			.values(fakeUsers.slice(i, i + BATCH_SIZE))
			.onConflictDoNothing();
	}

	console.log(`[${chalk.green('✓')}] Database seeded`);
}

void main();
