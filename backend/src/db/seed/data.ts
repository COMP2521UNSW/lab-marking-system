import type { activitiesTable, settingsTable } from '@/db/db';

import { genClasses, genUsers } from './gen';

export const fakeSettings: (typeof settingsTable.$inferInsert)[] = [
	{
		termStartDate: new Date(2026, 1, 16),
		termEndDate: new Date(2026, 3, 24),
		earlyRequestMinutes: 15,
	},
];

// prettier-ignore
export const fakeActivities: (typeof activitiesTable.$inferInsert)[] = [
	{
		code: 'lab01', name: 'Lab 1', ordering: 1,
		smsName: 'lab01_subj', maxMark: 3,
		startWeek: 1, endWeek: 3,
	},
	{
		code: 'lab03', name: 'Lab 3', ordering: 2,
		smsName: 'lab03_subj', maxMark: 5,
		startWeek: 3, endWeek: 5,
	},
	{
		code: 'lab04', name: 'Lab 4', ordering: 3,
		smsName: 'lab04_subj', maxMark: 1,
		startWeek: 4, endWeek: 7,
	},
	{
		code: 'lab05', name: 'Lab 5', ordering: 4,
		smsName: 'lab05_subj', maxMark: 1,
		startWeek: 5, endWeek: 8,
	},
	{
		code: 'lab07', name: 'Lab 7', ordering: 5,
		smsName: 'lab07_subj', maxMark: 5,
		startWeek: 7, endWeek: 9,
	},
	{
		code: 'lab08', name: 'Lab 8', ordering: 6,
		smsName: 'lab08_subj', maxMark: 1,
		startWeek: 8, endWeek: 10,
	},
];

export const fakeClasses = genClasses();

export const fakeUsers = genUsers(
	{ numAdmins: 5, numTutors: 25, numStudents: 1000 },
	fakeClasses,
);
