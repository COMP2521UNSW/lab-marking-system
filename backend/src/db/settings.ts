import { get } from '@/cache/cache';

import { db, settingsTable } from './db';

////////////////////////////////////////////////////////////////////////////////

export async function getTermDates() {
	return await get('getTermDates', dbGetTermDates);
}

async function dbGetTermDates() {
	const rows = await db
		.select({
			startDate: settingsTable.termStartDate,
			endDate: settingsTable.termEndDate,
		})
		.from(settingsTable);

	return rows[0];
}

////////////////////////////////////////////////////////////////////////////////

export async function getEarlyRequestMinutes() {
	return await get('getEarlyRequestMinutes', dbGetEarlyRequestMinutes);
}

async function dbGetEarlyRequestMinutes() {
	const rows = await db
		.select({
			earlyRequestMinutes: settingsTable.earlyRequestMinutes,
		})
		.from(settingsTable);

	return rows[0].earlyRequestMinutes;
}

////////////////////////////////////////////////////////////////////////////////
