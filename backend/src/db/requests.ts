import { and, eq, gte, inArray, isNull, or, sql } from 'drizzle-orm';
import type { Temporal } from 'temporal-polyfill';

import type { NonNullableKeys } from '@workspace/types/utils';

import {
	activitiesTable,
	alias,
	classesTable,
	db,
	manualRequestsTable,
	requestsTable,
	usersTable,
} from './db';

////////////////////////////////////////////////////////////////////////////////

export async function getCurrentClass(zid: string) {
	const rows = await db
		.select({
			code: classesTable.code,
			labLocation: classesTable.labLocation,
		})
		.from(requestsTable)
		.innerJoin(classesTable, eq(classesTable.code, requestsTable.classCode))
		.where(
			and(eq(requestsTable.studentZid, zid), isNull(requestsTable.closedAt)),
		)
		.limit(1);

	return rows.length > 0 ? rows[0] : null;
}

/**
 * If activityCodes is supplied, get open requests for the given activities
 * only, otherwise get all open requests
 */
export async function getOpenRequestsByUser(
	zid: string,
	activityCodes?: string[],
) {
	return await db
		.select({
			id: requestsTable.id,
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
				maxMark: activitiesTable.maxMark,
			},
			createdAt: requestsTable.requestedAt,
			status: requestsTable.status,
			marker: {
				zid: usersTable.zid,
				name: usersTable.name,
			},
			closedAt: requestsTable.closedAt,
		})
		.from(requestsTable)
		.innerJoin(
			activitiesTable,
			eq(activitiesTable.code, requestsTable.activityCode),
		)
		.leftJoin(usersTable, eq(usersTable.zid, requestsTable.markerZid))
		.where(
			and(
				eq(requestsTable.studentZid, zid),
				isNull(requestsTable.closedAt),
				activityCodes === undefined
					? undefined
					: inArray(requestsTable.activityCode, activityCodes),
			),
		);
}

export async function updateRequestsClass(
	zid: string,
	classCode: string,
	timestamp: Temporal.Instant,
) {
	await db
		.update(requestsTable)
		.set({
			classCode,
			requestedAt: timestamp,
		})
		.where(
			and(eq(requestsTable.studentZid, zid), isNull(requestsTable.closedAt)),
		);
}

export async function createRequests(
	zid: string,
	classCode: string,
	activityCodes: string[],
	timestamp: Temporal.Instant,
) {
	if (activityCodes.length === 0) {
		return;
	}

	return await db
		.insert(requestsTable)
		.values(
			activityCodes.map((activityCode) => ({
				studentZid: zid,
				classCode,
				activityCode,
				createdAt: timestamp,
				requestedAt: timestamp,
				status: 'pending' as const,
			})),
		)
		.returning({
			id: requestsTable.id,
		});
}

export async function withdrawRequest(
	zid: string,
	id: number,
	reason: string,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.update(requestsTable)
		.set({
			status: 'withdrawn',
			markerZid: null,
			closedAt: timestamp,
			withdrawReason: reason,
		})
		.where(
			and(
				eq(requestsTable.id, id),
				eq(requestsTable.studentZid, zid),
				isNull(requestsTable.closedAt),
			),
		)
		.returning({
			id: requestsTable.id,
			classCode: requestsTable.classCode,
			activityCode: requestsTable.activityCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function getActiveOrRecentRequestsByClass(
	classCode: string,
	recentTimestamp: Temporal.Instant,
) {
	const markersTable = alias(usersTable, 'markersTable');

	return await db
		.select({
			id: requestsTable.id,
			student: {
				zid: usersTable.zid,
				name: usersTable.name,
			},
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
				maxMark: activitiesTable.maxMark,
			},
			createdAt: requestsTable.requestedAt,
			status: requestsTable.status,
			marker: {
				zid: markersTable.zid,
				name: markersTable.name,
			},
			mark: requestsTable.mark,
			closedAt: requestsTable.closedAt,
			reason: sql<
				string | null
			>`coalesce(${requestsTable.withdrawReason}, ${requestsTable.declineReason})`,
		})
		.from(requestsTable)
		.innerJoin(usersTable, eq(usersTable.zid, requestsTable.studentZid))
		.innerJoin(
			activitiesTable,
			eq(activitiesTable.code, requestsTable.activityCode),
		)
		.leftJoin(markersTable, eq(markersTable.zid, requestsTable.markerZid))
		.where(
			and(
				eq(requestsTable.classCode, classCode),
				or(
					isNull(requestsTable.closedAt),
					gte(requestsTable.closedAt, recentTimestamp),
				),
			),
		)
		.orderBy(
			requestsTable.closedAt,
			requestsTable.requestedAt,
			activitiesTable.ordering,
		);
}

export async function claimRequest(id: number, tutorZid: string) {
	const rows = await db
		.update(requestsTable)
		.set({
			markerZid: tutorZid,
		})
		.where(
			and(
				eq(requestsTable.id, id),
				eq(requestsTable.status, 'pending'),
				isNull(requestsTable.closedAt),
			),
		)
		.returning({
			id: requestsTable.id,
			classCode: requestsTable.classCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function unclaimRequest(id: number, tutorZid: string) {
	const rows = await db
		.update(requestsTable)
		.set({
			markerZid: null,
		})
		.where(
			and(
				eq(requestsTable.id, id),
				eq(requestsTable.status, 'pending'),
				eq(requestsTable.markerZid, tutorZid),
				isNull(requestsTable.closedAt),
			),
		)
		.returning({
			id: requestsTable.id,
			classCode: requestsTable.classCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function declineRequest(
	id: number,
	tutorZid: string,
	reason: string,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.update(requestsTable)
		.set({
			status: 'declined',
			markerZid: tutorZid,
			declineReason: reason,
			closedAt: timestamp,
		})
		.where(
			and(
				eq(requestsTable.id, id),
				eq(requestsTable.status, 'pending'),
				isNull(requestsTable.closedAt),
			),
		)
		.returning({
			id: requestsTable.id,
			studentZid: requestsTable.studentZid,
			activityCode: requestsTable.activityCode,
			classCode: requestsTable.classCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function markRequest(
	id: number,
	markerZid: string,
	mark: number,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.update(requestsTable)
		.set({
			status: 'marked',
			markerZid,
			mark,
			closedAt: timestamp,
		})
		.where(
			and(
				eq(requestsTable.id, id),
				eq(requestsTable.status, 'pending'),
				isNull(requestsTable.closedAt),
			),
		)
		.returning({
			id: requestsTable.id,
			studentZid: requestsTable.studentZid,
			activityCode: requestsTable.activityCode,
			classCode: requestsTable.classCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function getOpenRequest(id: number) {
	const rows = await db
		.select({
			id: requestsTable.id,
			activityCode: requestsTable.activityCode,
		})
		.from(requestsTable)
		.where(and(eq(requestsTable.id, id), eq(requestsTable.status, 'pending')));

	return rows.length > 0 ? rows[0] : null;
}

export async function getMarkedRequest(id: number) {
	const rows = await db
		.select({
			activityCode: requestsTable.activityCode,
			markedAt: requestsTable.closedAt,
			mark: requestsTable.mark,
		})
		.from(requestsTable)
		.where(and(eq(requestsTable.id, id), eq(requestsTable.status, 'marked')));

	// markedAt and mark are guaranteed to be non-NULL for marked requests due to
	// markRequest()
	return rows.length > 0
		? (rows[0] as NonNullableKeys<(typeof rows)[number], 'markedAt' | 'mark'>)
		: null;
}

export async function amendMark(id: number, tutorZid: string, mark: number) {
	const res = await db
		.update(requestsTable)
		.set({
			markerZid: tutorZid,
			mark,
		})
		.where(and(eq(requestsTable.id, id), eq(requestsTable.status, 'marked')))
		.returning({
			id: requestsTable.id,
			studentZid: requestsTable.studentZid,
			activityCode: requestsTable.activityCode,
			classCode: requestsTable.classCode,
		});

	return res.length > 0 ? res[0] : null;
}

////////////////////////////////////////////////////////////////////////////////

export async function createManualRequest(
	studentZid: string,
	activityCode: string,
	reason: string,
	mark: number,
	tutorZid: string,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.insert(manualRequestsTable)
		.values({
			studentZid,
			activityCode,
			reason,
			mark,
			markerZid: tutorZid,
			createdAt: timestamp,
			status: 'pending',
		})
		.returning({
			id: manualRequestsTable.id,
		});

	return rows[0];
}

export async function getManualRequests(ids?: number[]) {
	const tutorsTable = alias(usersTable, 'tutorsTable');
	const adminsTable = alias(usersTable, 'adminsTable');

	return await db
		.select({
			id: manualRequestsTable.id,
			student: {
				zid: usersTable.zid,
				name: usersTable.name,
			},
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
				maxMark: activitiesTable.maxMark,
			},
			reason: manualRequestsTable.reason,
			mark: manualRequestsTable.mark,
			markerName: tutorsTable.name,
			markedAt: manualRequestsTable.createdAt,
			status: manualRequestsTable.status,
			approverName: adminsTable.name,
			closedAt: manualRequestsTable.closedAt,
			denyReason: manualRequestsTable.denyReason,
		})
		.from(manualRequestsTable)
		.innerJoin(usersTable, eq(usersTable.zid, manualRequestsTable.studentZid))
		.innerJoin(
			activitiesTable,
			eq(activitiesTable.code, manualRequestsTable.activityCode),
		)
		.innerJoin(tutorsTable, eq(tutorsTable.zid, manualRequestsTable.markerZid))
		.leftJoin(adminsTable, eq(adminsTable.zid, manualRequestsTable.approverZid))
		.where(ids === undefined ? undefined : inArray(manualRequestsTable.id, ids))
		.orderBy(manualRequestsTable.closedAt, manualRequestsTable.createdAt);
}

export async function approveManualRequest(
	id: number, //
	approverZid: string,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.update(manualRequestsTable)
		.set({
			status: 'approved',
			approverZid,
			closedAt: timestamp,
		})
		.where(
			and(
				eq(manualRequestsTable.id, id),
				eq(manualRequestsTable.status, 'pending'),
			),
		)
		.returning({
			studentZid: manualRequestsTable.studentZid,
			activityCode: manualRequestsTable.activityCode,
			mark: manualRequestsTable.mark,
			createdAt: manualRequestsTable.createdAt,
		});

	return rows.length > 0 ? rows[0] : null;
}

export async function denyManualRequest(
	id: number,
	approverZid: string,
	reason: string,
	timestamp: Temporal.Instant,
) {
	const rows = await db
		.update(manualRequestsTable)
		.set({
			status: 'denied',
			approverZid,
			closedAt: timestamp,
			denyReason: reason,
		})
		.where(
			and(
				eq(manualRequestsTable.id, id),
				eq(manualRequestsTable.status, 'pending'),
			),
		)
		.returning({
			id: manualRequestsTable.id,
			studentZid: manualRequestsTable.studentZid,
			activityCode: manualRequestsTable.activityCode,
		});

	return rows.length > 0 ? rows[0] : null;
}

////////////////////////////////////////////////////////////////////////////////
