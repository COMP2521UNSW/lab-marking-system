import { and, eq, like, or } from 'drizzle-orm';

import { get } from '@/db/cache';
import type { NonNullableKeys } from '@/types/utils';

import { db } from './db';
import { usersTable } from './schema/schema';

////////////////////////////////////////////////////////////////////////////////

export async function getUserByZid(zid: string) {
	return await get(`users?zid=${zid}`, () => dbGetUserByZid(zid));
}

async function dbGetUserByZid(zid: string) {
	const rows = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.zid, zid));

	return rows.length > 0 ? rows[0] : null;
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentByZid(zid: string) {
	return await get(`students?zid=${zid}`, () => dbGetStudentByZid(zid));
}

async function dbGetStudentByZid(zid: string) {
	const rows = await db
		.select({
			zid: usersTable.zid,
			name: usersTable.name,
		})
		.from(usersTable)
		.where(and(eq(usersTable.zid, zid), eq(usersTable.role, 'student')));

	return rows.length > 0 ? rows[0] : null;
}

////////////////////////////////////////////////////////////////////////////////

export async function searchStudents(query: string) {
	const rows = await db
		.select({
			zid: usersTable.zid,
			name: usersTable.name,
			classCode: usersTable.classCode,
		})
		.from(usersTable)
		.where(
			and(
				eq(usersTable.role, 'student'),
				or(
					like(usersTable.zid, '%' + query + '%'),
					like(usersTable.name, '%' + query + '%'),
				),
				eq(usersTable.enrolled, true),
			),
		);

	// classCode is guaranteed to be non-NULL for students due to CHECK constraint
	return rows as NonNullableKeys<(typeof rows)[number], 'classCode'>[];
}

////////////////////////////////////////////////////////////////////////////////
