import { eq } from 'drizzle-orm';

import { activitiesTable, alias, db, logsTable, usersTable } from './db';

////////////////////////////////////////////////////////////////////////////////

export async function logClassChanged(
	studentZid: string,
	classCode: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'class-changed',
		classCode,
		timestamp,
	});
}

export async function logRequestsCreated(
	studentZid: string,
	activityCodes: string[],
	classCode: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values(
		activityCodes.map((activityCode) => ({
			studentZid,
			event: 'request-created' as const,
			activityCode,
			classCode,
			timestamp,
		})),
	);
}

export async function logRequestWithdrawn(
	studentZid: string,
	activityCode: string,
	classCode: string,
	reason: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'request-withdrawn',
		activityCode,
		classCode,
		reason,
		timestamp,
	});
}

export async function logRequestDeclined(
	studentZid: string,
	activityCode: string,
	classCode: string,
	markerZid: string,
	reason: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'request-declined',
		activityCode,
		classCode,
		markerZid,
		reason,
		timestamp,
	});
}

export async function logRequestMarked(
	studentZid: string,
	activityCode: string,
	classCode: string,
	markerZid: string,
	mark: number,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'request-marked',
		activityCode,
		classCode,
		markerZid,
		mark,
		timestamp,
	});
}

export async function logMarkAmended(
	studentZid: string,
	activityCode: string,
	classCode: string,
	markerZid: string,
	mark: number,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'mark-amended',
		activityCode,
		classCode,
		markerZid,
		mark,
		timestamp,
	});
}

export async function logManualRequestCreated(
	studentZid: string,
	activityCode: string,
	markerZid: string,
	mark: number,
	reason: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'manual-request-created',
		activityCode,
		markerZid,
		mark,
		reason,
		timestamp,
	});
}

export async function logManualRequestApproved(
	studentZid: string,
	activityCode: string,
	approverZid: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'manual-request-approved',
		activityCode,
		approverZid,
		timestamp,
	});
}

export async function logManualRequestDenied(
	studentZid: string,
	activityCode: string,
	approverZid: string,
	reason: string,
	timestamp: Date,
) {
	await db.insert(logsTable).values({
		studentZid,
		event: 'manual-request-denied',
		activityCode,
		approverZid,
		reason,
		timestamp,
	});
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentLogs(studentZid: string) {
	const markersTable = alias(usersTable, 'markersTable');
	const approversTable = alias(usersTable, 'approversTable');

	return await db
		.select({
			eventType: logsTable.event,
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
				maxMark: activitiesTable.maxMark,
			},
			classCode: logsTable.classCode,
			markerName: markersTable.name,
			mark: logsTable.mark,
			approverName: approversTable.name,
			reason: logsTable.reason,
			timestamp: logsTable.timestamp,
		})
		.from(logsTable)
		.leftJoin(activitiesTable, eq(activitiesTable.code, logsTable.activityCode))
		.leftJoin(markersTable, eq(markersTable.zid, logsTable.markerZid))
		.leftJoin(approversTable, eq(approversTable.zid, logsTable.approverZid))
		.where(eq(logsTable.studentZid, studentZid));
}

////////////////////////////////////////////////////////////////////////////////
