import 'dotenv/config';

import { parseArgs } from 'node:util';

import * as cheerio from 'cheerio';
import { sql } from 'drizzle-orm';

import { COURSE_CODE, SESSION } from '@workspace/config';

import { classesTable, db } from '@/db/db';
import { logger } from '@/lib/logger';
import type { Time } from '@/types/time';

import { parseError } from './utils';

type Class = typeof classesTable.$inferInsert;

const TIMETABLE_URL = `https://cgi.cse.unsw.edu.au/~give/Admindata/${SESSION}/${COURSE_CODE}_timetable.html`;

async function main() {
	const {
		values: { dryrun },
	} = parseArgs({
		options: {
			dryrun: { type: 'boolean' as const, default: false },
		},
	});

	const classes = await parseClasses(TIMETABLE_URL);

	if (dryrun) {
		console.log(classes);
	} else {
		await insertClasses(classes);
	}
}

const DAY_TO_NUM = new Map([
	['Mon', 1],
	['Tue', 2],
	['Wed', 3],
	['Thu', 4],
	['Fri', 5],
	['Sat', 6],
	['Sun', 7],
]);

async function parseClasses(url: string): Promise<Class[]> {
	try {
		const res = await fetch(url);
		const html = await res.text();

		const $ = cheerio.load(html);

		const classes = $('.table.table-condensed.table-striped tr')
			.map((i, row) => {
				const cells = $(row).find('td');

				const classCode = $(cells.get(0)).text();
				const cseClassCode = $(cells.get(1)).text();

				const labDetails = $($(cells.get(3)).find('.row').get(1)).find('div');

				// E.g., Mon 12:00 - 14:00
				const labTime = $(labDetails.get(1)).text();

				const day = labTime.match(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
				if (!day) {
					return null;
				}
				const dayOfWeek = DAY_TO_NUM.get(day[0])!;

				const times = labTime.match(/[0-9][0-9]:[0-9][0-9]/g);
				if (!times) {
					return null;
				}
				const labStartTime = times[0] as Time;
				const labEndTime = times[1] as Time;

				// E.g., LuteM15530
				const labLocationCode = $(labDetails.get(2)).text().trim();
				const room = labLocationCode.match(/^[A-Z][a-z]*/)?.[0];
				if (!room) {
					return null;
				}
				const labLocation = room === 'Online' ? 'Online' : `${room} Lab`;

				return {
					code: classCode,
					cseCode: cseClassCode,
					dayOfWeek,
					labStartTime,
					labEndTime,
					labLocation,
				};
			})
			.toArray();

		return classes;
	} catch (err) {
		logger.error(parseError(err));
		process.exit(1);
	}
}

async function insertClasses(classes: Class[]) {
	await db
		.insert(classesTable)
		.values(classes)
		.onConflictDoUpdate({
			target: classesTable.code,
			set: {
				dayOfWeek: sql`excluded."dayOfWeek"`,
				labStartTime: sql`excluded."labStartTime"`,
				labEndTime: sql`excluded."labEndTime"`,
				labLocation: sql`excluded."labLocation"`,
			},
		});
}

void main();
