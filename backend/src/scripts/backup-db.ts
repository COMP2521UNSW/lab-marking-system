import '@@/env-config';

import * as pgDb from '@/db/dialects/pg/db';
import * as sqliteDb from '@/db/dialects/sqlite/db';

const BATCH_SIZE = 1000;

async function main() {
	await copySettings();
	await copyActivities();
	await copyClasses();
	await copyUsers();
	await copyRequests();
	await copyManualRequests();
	await copyMarks();
	await copySyncedMarks();
	await copyLogs();
}

async function copySettings() {
	console.log('Copying settings...');

	const settings = await pgDb.db.select().from(pgDb.settingsTable);
	await sqliteDb.db.insert(sqliteDb.settingsTable).values(settings);
}

async function copyActivities() {
	console.log('Copying activities...');

	const activities = await pgDb.db.select().from(pgDb.activitiesTable);
	await sqliteDb.db.insert(sqliteDb.activitiesTable).values(activities);
}

async function copyClasses() {
	console.log('Copying classes...');

	const classes = await pgDb.db.select().from(pgDb.classesTable);
	await sqliteDb.db.insert(sqliteDb.classesTable).values(classes);
}

async function copyUsers() {
	console.log('Copying users...');

	const users = await pgDb.db.select().from(pgDb.usersTable);
	for (let i = 0; i < users.length; i += BATCH_SIZE) {
		console.log(`- ${i + 1}-${Math.min(i + BATCH_SIZE, users.length)}`);
		const batch = users.slice(i, i + BATCH_SIZE);
		await sqliteDb.db.insert(sqliteDb.usersTable).values(batch);
	}
}

async function copyRequests() {
	console.log('Copying requests...');

	const requests = await pgDb.db.select().from(pgDb.requestsTable);
	for (let i = 0; i < requests.length; i += BATCH_SIZE) {
		console.log(`- ${i + 1}-${Math.min(i + BATCH_SIZE, requests.length)}`);
		const batch = requests.slice(i, i + BATCH_SIZE);
		await sqliteDb.db.insert(sqliteDb.requestsTable).values(batch);
	}
}

async function copyManualRequests() {
	console.log('Copying manual requests...');

	const manualRequests = await pgDb.db.select().from(pgDb.manualRequestsTable);
	await sqliteDb.db.insert(sqliteDb.manualRequestsTable).values(manualRequests);
}

async function copyMarks() {
	console.log('Copying marks...');

	const marks = await pgDb.db.select().from(pgDb.marksTable);
	for (let i = 0; i < marks.length; i += BATCH_SIZE) {
		console.log(`- ${i + 1}-${Math.min(i + BATCH_SIZE, marks.length)}`);
		const batch = marks.slice(i, i + BATCH_SIZE);
		await sqliteDb.db.insert(sqliteDb.marksTable).values(batch);
	}
}

async function copySyncedMarks() {
	console.log('Copying synced marks...');

	const syncedMarks = await pgDb.db.select().from(pgDb.syncedMarksTable);
	for (let i = 0; i < syncedMarks.length; i += BATCH_SIZE) {
		console.log(`- ${i + 1}-${Math.min(i + BATCH_SIZE, syncedMarks.length)}`);
		const batch = syncedMarks.slice(i, i + BATCH_SIZE);
		await sqliteDb.db.insert(sqliteDb.syncedMarksTable).values(batch);
	}
}

async function copyLogs() {
	console.log('Copying logs...');

	const logs = await pgDb.db.select().from(pgDb.logsTable);
	for (let i = 0; i < logs.length; i += BATCH_SIZE) {
		console.log(`- ${i + 1}-${Math.min(i + BATCH_SIZE, logs.length)}`);
		const batch = logs.slice(i, i + BATCH_SIZE);
		await sqliteDb.db.insert(sqliteDb.logsTable).values(batch);
	}
}

void main();
