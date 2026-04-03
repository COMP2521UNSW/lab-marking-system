import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
	unique,
} from 'drizzle-orm/sqlite-core';

import {
	boolean,
	date,
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	timestamp,
	userRoleEnum,
} from './custom-types';

export const settingsTable = sqliteTable(
	'settings', //
	{
		id: integer().primaryKey(),
		termStartDate: date().notNull(),
		termEndDate: date().notNull(), // inclusive
	},
	(table) => [check('singleton_check', sql`${table.id} = 1`)],
);

export const activitiesTable = sqliteTable(
	'activities', //
	{
		code: text().primaryKey(),
		name: text().notNull(),
		ordering: integer(),
		smsName: text().unique(),
		maxMark: integer().notNull(),
		startWeek: integer().notNull(),
		endWeek: integer().notNull(),
	},
	(table) => [
		check('maxMark_check', sql`${table.maxMark} >= 0`),
		check('week_check', sql`${table.startWeek} <= ${table.endWeek}`),
	],
);

export const classesTable = sqliteTable(
	'classes', //
	{
		code: text().primaryKey(),
		cseCode: text().unique(),
		dayOfWeek: integer().notNull(), // 1 = Monday, 7 = Sunday
		labStartTime: time().notNull(),
		labEndTime: time().notNull(),
		labLocation: text().notNull(),
		weeks: text(), // e.g., '1-5,7,9-10' (NULL = all weeks)
	},
	(table) => [
		check('dayOfWeek_check', sql`${table.dayOfWeek} BETWEEN 1 AND 7`),
	],
);

export const usersTable = sqliteTable(
	'users', //
	{
		zid: text().primaryKey(),
		name: text().notNull(),
		role: userRoleEnum().notNull(),
		classCode: text().references(() => classesTable.code),
		enrolled: boolean().notNull().default(true),
	},
	(table) => [
		check('role_check', sql`${table.role} in ('student', 'tutor', 'admin')`),
	],
);

export const requestsTable = sqliteTable(
	'requests', //
	{
		id: integer().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		classCode: text()
			.references(() => classesTable.code)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		createdAt: timestamp().notNull(),
		requestedAt: timestamp().notNull(),
		status: requestStatusEnum().notNull(),
		markerZid: text().references(() => usersTable.zid),
		mark: real(),
		closedAt: timestamp(),
		withdrawReason: text(),
		declineReason: text(),
	},
	(table) => [index('requests_studentZid_index').on(table.studentZid)],
);

export const manualRequestsTable = sqliteTable(
	'manualRequests', //
	{
		id: integer().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		reason: text().notNull(),
		mark: real().notNull(),
		markerZid: text().references(() => usersTable.zid),
		createdAt: timestamp().notNull(),
		status: manualRequestStatusEnum().notNull(),
		approverZid: text().references(() => usersTable.zid),
		closedAt: timestamp(),
		denyReason: text(),
	},
);

export const marksTable = sqliteTable(
	'marks', //
	{
		id: integer().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		mark: real(),
		enteredAt: timestamp().notNull(),
	},
	(table) => [unique().on(table.studentZid, table.activityCode)],
);

export const syncedMarksTable = sqliteTable(
	'syncedMarks', //
	{
		id: integer().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		mark: real(),
	},
	(table) => [unique().on(table.studentZid, table.activityCode)],
);

export const logsTable = sqliteTable(
	'logs', //
	{
		id: integer().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		event: eventEnum().notNull(),
		activityCode: text().references(() => activitiesTable.code),
		classCode: text().references(() => classesTable.code),
		timestamp: timestamp().notNull(),
		markerZid: text().references(() => usersTable.zid),
		mark: real(),
		approverZid: text().references(() => usersTable.zid),
		reason: text(),
	},
	(table) => [index('logs_studentZid_index').on(table.studentZid)],
);
