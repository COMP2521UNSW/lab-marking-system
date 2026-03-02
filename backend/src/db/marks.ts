import { and, eq } from 'drizzle-orm';

import { activitiesTable, db, marksTable } from './db';

async function setMark(
	studentZid: string,
	activityCode: string,
	mark: number,
	timestamp: Date,
) {
	await db
		.insert(marksTable)
		.values({
			studentZid,
			activityCode,
			mark,
			enteredAt: timestamp,
		})
		.onConflictDoUpdate({
			target: [marksTable.studentZid, marksTable.activityCode],
			set: { mark, enteredAt: timestamp },
		});
}

async function getStudentMarks(studentZid: string) {
	return await db
		.select({
			activity: {
				code: activitiesTable.code,
				name: activitiesTable.name,
				maxMark: activitiesTable.maxMark,
			},
			mark: marksTable.mark,
			markedAt: marksTable.enteredAt,
		})
		.from(activitiesTable)
		.leftJoin(
			marksTable,
			and(
				eq(marksTable.activityCode, activitiesTable.code),
				eq(marksTable.studentZid, studentZid),
			),
		)
		.orderBy(activitiesTable.ordering);
}

export { getStudentMarks, setMark };
