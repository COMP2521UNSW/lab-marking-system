import { eq } from 'drizzle-orm';

import { get } from '@/db/cache';

import { db } from './db';
import { classesTable } from './schema/schema';

////////////////////////////////////////////////////////////////////////////////

export async function getAllClasses() {
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

export async function getClassesByDay(day: number) {
	return await get(`classes?day=${day}`, () => dbGetClassesByDay(day));
}

async function dbGetClassesByDay(day: number) {
	return await db
		.select()
		.from(classesTable)
		.where(eq(classesTable.dayOfWeek, day));
}

////////////////////////////////////////////////////////////////////////////////

export async function getClassDetails(classCode: string) {
	return await get(`classes?code=${classCode}`, () =>
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
