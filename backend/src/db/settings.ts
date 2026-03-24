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
