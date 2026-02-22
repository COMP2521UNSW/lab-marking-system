import { and, eq, gte, lte } from 'drizzle-orm';

import { get } from '@/cache/cache';

import { activitiesTable, db, marksTable } from './db';

////////////////////////////////////////////////////////////////////////////////

export async function getAllActivities() {
	return await db
		.select({
			code: activitiesTable.code,
			name: activitiesTable.name,
			maxMark: activitiesTable.maxMark,
		})
		.from(activitiesTable);
}

export async function getActiveActivitiesAndMarksForUser(
	week: number,
	zid: string,
) {
	return await db
		.select({
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
			},
			mark: marksTable.mark,
		})
		.from(activitiesTable)
		.leftJoin(
			marksTable,
			and(
				eq(marksTable.activityCode, activitiesTable.code),
				eq(marksTable.studentZid, zid),
			),
		)
		.where(
			and(
				lte(activitiesTable.startWeek, week),
				gte(activitiesTable.endWeek, week),
			),
		)
		.orderBy(activitiesTable.ordering);
}

////////////////////////////////////////////////////////////////////////////////

export async function getActivityByCode(code: string) {
	return await get(`getActivityByCode:${code}`, () =>
		dbGetActivityByCode(code),
	);
}

async function dbGetActivityByCode(code: string) {
	const rows = await db
		.select({
			code: activitiesTable.code,
			name: activitiesTable.name,
			maxMark: activitiesTable.maxMark,
			startWeek: activitiesTable.startWeek,
			endWeek: activitiesTable.endWeek,
		})
		.from(activitiesTable)
		.where(eq(activitiesTable.code, code));

	return rows.length > 0 ? rows[0] : null;
}

////////////////////////////////////////////////////////////////////////////////
