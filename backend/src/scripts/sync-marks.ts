import '@@/env-config';

import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { eq, isNotNull, sql } from 'drizzle-orm';

import type { NonNullableKeys } from '@workspace/types/utils';

import { activitiesTable, db, marksTable, syncedMarksTable } from '@/db/db';
import { logMarksImportedFromSms } from '@/db/logs';
import { logger } from '@/lib/logger';

import { executeCommand } from './utils';

type Mark = {
	zid: string;
	code: string;
	smsName: string;
	mark: number | null;
};

////////////////////////////////////////////////////////////////////////////////

async function main() {
	const {
		values: { dryrun },
	} = parseArgs({
		options: {
			dryrun: { type: 'boolean' as const, default: false },
		},
	});

	const activities = await getAllActivities();

	const dbMarks = await getDbMarks();
	const dbSyncedMarks = await getDbSyncedMarks();
	const smsMarks = await getSmsMarks(activities);

	const dbDiffs = getDiffs(dbSyncedMarks, dbMarks);
	const smsDiffs = getDiffs(dbSyncedMarks, smsMarks);
	const { fromDb, fromSms } = mergeDiffs(dbDiffs, smsDiffs);

	if (dryrun) {
		console.log('Marks copied from DB to SMS:');
		console.log(fromDb);
		console.log('Marks copied from SMS to DB:');
		console.log(fromSms);
	} else {
		await saveDiffs(fromDb, fromSms);
	}
}

////////////////////////////////////////////////////////////////////////////////

async function getAllActivities() {
	const activities = await db
		.select({
			code: activitiesTable.code,
			smsName: activitiesTable.smsName,
		})
		.from(activitiesTable)
		.where(isNotNull(activitiesTable.smsName))
		.orderBy(activitiesTable.code);

	// smsName is guaranteed to be non-NULL due to WHERE clause
	return activities as NonNullableKeys<
		(typeof activities)[number],
		'smsName'
	>[];
}

async function getDbMarks() {
	const marks = await db
		.select({
			zid: marksTable.studentZid,
			code: activitiesTable.code,
			smsName: activitiesTable.smsName,
			mark: marksTable.mark,
		})
		.from(marksTable)
		.innerJoin(
			activitiesTable,
			eq(activitiesTable.code, marksTable.activityCode),
		)
		.where(isNotNull(activitiesTable.smsName))
		.orderBy(marksTable.studentZid, activitiesTable.code);

	// smsName is guaranteed to be non-NULL due to WHERE clause
	return marks as NonNullableKeys<(typeof marks)[number], 'smsName'>[];
}

async function getDbSyncedMarks() {
	const marks = await db
		.select({
			zid: syncedMarksTable.studentZid,
			code: activitiesTable.code,
			smsName: activitiesTable.smsName,
			mark: syncedMarksTable.mark,
		})
		.from(syncedMarksTable)
		.innerJoin(
			activitiesTable,
			eq(activitiesTable.code, syncedMarksTable.activityCode),
		)
		.where(isNotNull(activitiesTable.smsName))
		.orderBy(syncedMarksTable.studentZid, activitiesTable.code);

	// smsName is guaranteed to be non-NULL due to WHERE clause
	return marks as NonNullableKeys<(typeof marks)[number], 'smsName'>[];
}

async function getSmsMarks(activities: { code: string; smsName: string }[]) {
	const smsNames = activities.map((activity) => activity.smsName);

	let stdout: string;
	try {
		stdout = await executeCommand(
			`name -p ${smsNames.join(' ')} | cut -f1,4- | sort`,
		);
	} catch {
		process.exit(1);
	}

	const lines = stdout.split('\n').filter((line) => line.length > 0);

	const smsMarks = [];
	for (const line of lines) {
		const [zid, ...marks] = line.split('\t');

		for (let i = 0; i < activities.length; i++) {
			smsMarks.push({
				zid: `z${zid}`,
				code: activities[i].code,
				smsName: activities[i].smsName,
				mark: marks[i] === '.' || marks[i] === '?' ? null : Number(marks[i]),
			});
		}
	}

	return smsMarks;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Assumes that oldMarks and newMarks are sorted
 */
export function getDiffs(oldMarks: Mark[], newMarks: Mark[]) {
	const diffs: Mark[] = [];

	let i = 0;
	let j = 0;
	while (i < oldMarks.length || j < newMarks.length) {
		if (j === newMarks.length) {
			break;
		} else if (i === oldMarks.length) {
			if (newMarks[j].mark !== null) {
				diffs.push(newMarks[j]);
			}
			j++;
		} else if (lessThan(oldMarks[i], newMarks[j])) {
			// should not be possible - all entries in old marks should appear in
			// new marks
			i++;
		} else if (lessThan(newMarks[j], oldMarks[i])) {
			if (newMarks[j].mark !== null) {
				diffs.push(newMarks[j]);
			}
			j++;
		} else {
			if (oldMarks[i].mark !== newMarks[j].mark) {
				diffs.push(newMarks[j]);
			}
			i++;
			j++;
		}
	}

	return diffs;
}

export function mergeDiffs(dbDiffs: Mark[], smsDiffs: Mark[]) {
	const fromDb: Mark[] = [];
	const fromSms: Mark[] = [];

	let i = 0;
	let j = 0;
	while (i < dbDiffs.length || j < smsDiffs.length) {
		if (j === smsDiffs.length) {
			fromDb.push(dbDiffs[i++]);
		} else if (i === dbDiffs.length) {
			fromSms.push(smsDiffs[j++]);
		} else if (lessThan(dbDiffs[i], smsDiffs[j])) {
			fromDb.push(dbDiffs[i++]);
		} else if (lessThan(smsDiffs[j], dbDiffs[i])) {
			fromSms.push(smsDiffs[j++]);
		} else {
			// if there are diffs from both DB and SMS, prioritise SMS
			fromSms.push(smsDiffs[j]);
			i++;
			j++;
		}
	}

	return { fromDb, fromSms };
}

function lessThan(a: Mark, b: Mark) {
	if (a.zid !== b.zid) {
		return a.zid < b.zid;
	} else {
		return a.code < b.code;
	}
}

////////////////////////////////////////////////////////////////////////////////

async function saveDiffs(fromDb: Mark[], fromSms: Mark[]) {
	const timestamp = new Date();

	await insertMarksIntoSms(fromDb);
	await updateMarksTable(fromSms, timestamp);
	await updateSyncedMarksTable([...fromDb, ...fromSms]);

	await logMarksImportedFromSms(
		fromSms.map((entry) => ({
			studentZid: entry.zid,
			activityCode: entry.code,
			mark: entry.mark,
		})),
		timestamp,
	);
}

async function insertMarksIntoSms(markEntries: Mark[]) {
	if (markEntries.length === 0) {
		logger.info('No marks to copy from DB to SMS');
		return;
	}

	logger.info(`Copying ${markEntries.length} marks from DB to SMS`);

	const data = markEntries
		.map((entry) => {
			const zid = entry.zid.slice(1);
			return `${zid}|${entry.smsName}|${entry.mark}\n`;
		})
		.join('');

	const smsPath = process.env.SMSDB!;
	writeFileSync(`${smsPath}/update_recs/lab_handmarking.upd`, data);

	await executeCommand('smsupdate lab_handmarking.upd');
}

async function updateMarksTable(markEntries: Mark[], timestamp: Date) {
	if (markEntries.length === 0) {
		logger.info('No marks to copy from SMS to DB');
		return;
	}

	logger.info(`Copying ${markEntries.length} marks from SMS to DB`);

	await db
		.insert(marksTable)
		.values(
			markEntries.map((entry) => ({
				studentZid: entry.zid,
				activityCode: entry.code,
				mark: entry.mark,
				enteredAt: timestamp,
			})),
		)
		.onConflictDoUpdate({
			target: [marksTable.studentZid, marksTable.activityCode],
			set: { mark: sql`EXCLUDED.mark` },
		});
}

async function updateSyncedMarksTable(markEntries: Mark[]) {
	if (markEntries.length === 0) return;

	await db
		.insert(syncedMarksTable)
		.values(
			markEntries.map((entry) => ({
				studentZid: entry.zid,
				activityCode: entry.code,
				mark: entry.mark,
			})),
		)
		.onConflictDoUpdate({
			target: [syncedMarksTable.studentZid, syncedMarksTable.activityCode],
			set: { mark: sql`EXCLUDED.mark` },
		});
}

////////////////////////////////////////////////////////////////////////////////

if (process.env.NODE_ENV !== 'test') {
	void main();
}
