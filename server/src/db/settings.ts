import { get } from '@/db/cache';

import { db } from './db';
import { settingsTable } from './schema/schema';

////////////////////////////////////////////////////////////////////////////////

export async function getTermDates() {
	return await get('settings/dates', dbGetTermDates);
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
	return await get('settings/early-request', dbGetEarlyRequestMinutes);
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
