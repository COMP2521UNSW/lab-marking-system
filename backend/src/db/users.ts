import { and, eq, or } from 'drizzle-orm';

import { get } from '@/lib/cache';

import { db, ilike, usersTable } from './db';

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
	return await db
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
					ilike(usersTable.zid, '%' + query + '%'),
					ilike(usersTable.name, '%' + query + '%'),
				),
				eq(usersTable.enrolled, true),
			),
		);
}

////////////////////////////////////////////////////////////////////////////////
