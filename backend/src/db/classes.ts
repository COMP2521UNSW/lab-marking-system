import { eq } from 'drizzle-orm';

import { get } from '@/cache/cache';

import { classesTable, db } from './db';

////////////////////////////////////////////////////////////////////////////////

export async function getAllClasses() {
	return await get('getAllClasses', dbGetAllClasses);
}

async function dbGetAllClasses() {
	return await db
		.select()
		.from(classesTable)
		.orderBy(
			classesTable.dayOfWeek,
			classesTable.labStartTime,
			classesTable.code,
		);
}

////////////////////////////////////////////////////////////////////////////////

export async function getClassDetails(classCode: string) {
	return await get(`getClassDetails:${classCode}`, () =>
		dbGetClassDetails(classCode),
	);
}

async function dbGetClassDetails(classCode: string) {
	const rows = await db
		.select()
		.from(classesTable)
		.where(eq(classesTable.code, classCode));

	return rows.length > 0 ? rows[0] : null;
}

////////////////////////////////////////////////////////////////////////////////
