import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	index,
	integer,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';

import {
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	userRoleEnum,
} from './custom-types';

export const settingsTable = pgTable(
	'settings', //
	{
		id: serial().primaryKey(),
		termStartDate: timestamp({ withTimezone: true }).notNull(),
		termEndDate: timestamp({ withTimezone: true }).notNull(),
		earlyRequestMinutes: integer().notNull().default(0),
	},
	(table) => [check('singleton_check', sql`${table.id} = 1`)],
);

export const activitiesTable = pgTable(
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
);

export const classesTable = pgTable(
	'classes', //
	{
		code: text().primaryKey(),
		dayOfWeek: integer().notNull(), // 1 = Monday, 7 = Sunday
		labStartTime: time().notNull(),
		labEndTime: time().notNull(),
		labLocation: text().notNull(),
	},
	(table) => [
		check('dayOfWeek_check', sql`${table.dayOfWeek} BETWEEN 1 AND 7`),
		check('labTime_check', sql`${table.labStartTime} < ${table.labEndTime}`),
	],
);

export const usersTable = pgTable(
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
		check(
			'classCode_check',
			sql`
        (${table.role} = 'student' AND ${table.classCode} IS NOT NULL)
        OR (${table.role} <> 'student' AND ${table.classCode} IS NULL)
      `,
		),
	],
);

export const requestsTable = pgTable(
	'requests', //
	{
		id: serial().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		classCode: text()
			.references(() => classesTable.code)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		createdAt: timestamp({ withTimezone: true }).notNull(),
		requestedAt: timestamp({ withTimezone: true }).notNull(),
		status: requestStatusEnum().notNull(),
		markerZid: text().references(() => usersTable.zid),
		mark: real(),
		closedAt: timestamp({ withTimezone: true }),
		withdrawReason: text(),
		declineReason: text(),
	},
	(table) => [index('requests_studentZid_index').on(table.studentZid)],
);

export const manualRequestsTable = pgTable(
	'manualRequests', //
	{
		id: serial().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		reason: text().notNull(),
		mark: real().notNull(),
		markerZid: text().references(() => usersTable.zid),
		createdAt: timestamp({ withTimezone: true }).notNull(),
		status: manualRequestStatusEnum().notNull(),
		approverZid: text().references(() => usersTable.zid),
		closedAt: timestamp({ withTimezone: true }),
		denyReason: text(),
	},
);

export const marksTable = pgTable(
	'marks', //
	{
		id: serial().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		activityCode: text()
			.references(() => activitiesTable.code)
			.notNull(),
		mark: real(),
		enteredAt: timestamp({ withTimezone: true }).notNull(),
	},
	(table) => [unique().on(table.studentZid, table.activityCode)],
);

export const syncedMarksTable = pgTable(
	'syncedMarks', //
	{
		id: serial().primaryKey(),
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

export const logsTable = pgTable(
	'logs', //
	{
		id: serial().primaryKey(),
		studentZid: text()
			.references(() => usersTable.zid)
			.notNull(),
		event: eventEnum().notNull(),
		activityCode: text().references(() => activitiesTable.code),
		classCode: text().references(() => classesTable.code),
		timestamp: timestamp({ withTimezone: true }).notNull(),
		markerZid: text().references(() => usersTable.zid),
		mark: real(),
		approverZid: text().references(() => usersTable.zid),
		reason: text(),
	},
	(table) => [index('logs_studentZid_index').on(table.studentZid)],
);
