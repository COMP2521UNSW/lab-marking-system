import 'dotenv/config';

import { db } from '@/db/db';
import {
	activitiesTable,
	classesTable,
	settingsTable,
	usersTable,
} from '@/db/schema/schema';

import { fakeActivities, fakeClasses, fakeSettings, fakeUsers } from './data';

const BATCH_SIZE = 25;

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
}

void main();
