import '@/../env.config';

import { parseArgs } from 'node:util';

import { eq, isNotNull, sql } from 'drizzle-orm';

import { COURSE_CODE, SESSION } from '@workspace/config';

import { classesTable, db, usersTable } from '@/db/db';
import { logger } from '@/lib/logger';

import { executeCommand, parseError } from './utils';

type Student = {
	zid: string;
	name: string;
	classCode: string | null;
	enrolled: boolean;
};

const ENROLLMENTS_FILE = `~teachadmin/lib/enrollments/${SESSION}_${COURSE_CODE.slice(0, 4)}`;

const BATCH_SIZE = 250;

async function main() {
	const {
		values: { dryrun },
	} = parseArgs({
		options: {
			dryrun: { type: 'boolean' as const, default: false },
		},
	});

	const dbStudents = await getDbStudents();

	const classMap = await getClassMap();
	const officialStudents = await parseEnrollments(ENROLLMENTS_FILE, classMap);

	const diffs = getDiffs(dbStudents, officialStudents);

	if (dryrun) {
		console.log(diffs);
	} else {
		await insertStudents(diffs);
	}
}

async function getDbStudents() {
	return await db
		.select({
			zid: usersTable.zid,
			name: usersTable.name,
			classCode: usersTable.classCode,
			enrolled: usersTable.enrolled,
		})
		.from(usersTable)
		.where(eq(usersTable.role, 'student'))
		.orderBy(usersTable.zid);
}

async function getClassMap() {
	const classes = await db
		.select({
			code: classesTable.code,
			cseCode: classesTable.cseCode,
		})
		.from(classesTable)
		.where(isNotNull(classesTable.cseCode));

	return new Map(classes.map((cls) => [cls.cseCode as string, cls.code]));
}

async function parseEnrollments(
	enrollmentsFile: string,
	classMap: Map<string, string>,
) {
	let stdout: string;

	try {
		stdout = await executeCommand(
			`grep "^${COURSE_CODE}" ${enrollmentsFile} | cut -f2,3,10 -d'|' | sort`,
		);
	} catch {
		process.exit(1);
	}

	try {
		const students = stdout
			.split('\n')
			.filter((line) => line.length > 0)
			.map((line) => line.split('|'))
			.filter(([zid, name, cseClassCode]) => cseClassCode !== 'crs')
			.map(([zid, name, cseClassCode]) => ({
				zid: `z${zid}`,
				name: name
					.split(', ')
					.toReversed()
					.map((s) => s.trim())
					.filter((s) => s !== '.')
					.join(' '),
				classCode: classMap.get(cseClassCode) || null,
				enrolled: true,
			}));

		return students;
	} catch (err) {
		logger.error(parseError(err));
		process.exit(1);
	}
}

function getDiffs(dbStudents: Student[], sourceStudents: Student[]) {
	const diffs = [];

	let i = 0;
	let j = 0;
	while (i < dbStudents.length || j < sourceStudents.length) {
		if (j === sourceStudents.length) {
			diffs.push({ ...dbStudents[i], enrolled: false });
			i++;
		} else if (i === dbStudents.length) {
			diffs.push(sourceStudents[j]);
			j++;
		} else if (dbStudents[i].zid < sourceStudents[j].zid) {
			diffs.push({ ...dbStudents[i], enrolled: false });
			i++;
		} else if (sourceStudents[j].zid < dbStudents[i].zid) {
			diffs.push(sourceStudents[j]);
			j++;
		} else {
			if (
				dbStudents[i].name !== sourceStudents[j].name ||
				dbStudents[i].classCode !== sourceStudents[j].classCode ||
				dbStudents[i].enrolled !== sourceStudents[j].enrolled
			) {
				diffs.push(sourceStudents[j]);
			}
			i++;
			j++;
		}
	}

	return diffs;
}

async function insertStudents(students: Student[]) {
	for (let i = 0; i < students.length; i += BATCH_SIZE) {
		const batch = students.slice(i, i + BATCH_SIZE);
		await db
			.insert(usersTable)
			.values(
				batch.map((student) => ({
					...student,
					role: 'student' as const,
				})),
			)
			.onConflictDoUpdate({
				target: usersTable.zid,
				set: {
					name: sql`excluded.name`,
					classCode: sql`excluded."classCode"`,
					enrolled: sql`excluded.enrolled`,
				},
			});
	}
}

void main();
