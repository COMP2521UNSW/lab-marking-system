import '@@/env-config';

import { parseArgs } from 'node:util';

import { and, eq, isNotNull, sql } from 'drizzle-orm';

import { COURSE_CODE, SESSION } from '@workspace/config';

import { classesTable, db, usersTable } from '@/db/db';
import { logger } from '@/lib/logger';

import { parseError } from './utils/errors';
import { executeCommand } from './utils/exec';

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

	const dbStudents = await getDbEnrolledStudents();

	const classMap = await getClassMap();
	const sourceStudents = await parseEnrollments(ENROLLMENTS_FILE, classMap);
	await setPreferredNames(sourceStudents);

	const diffs = getDiffs(dbStudents, sourceStudents);

	if (dryrun) {
		console.log(diffs);
	} else {
		await insertStudents(diffs);
	}
}

async function getDbEnrolledStudents() {
	return await db
		.select({
			zid: usersTable.zid,
			name: usersTable.name,
			classCode: usersTable.classCode,
			enrolled: usersTable.enrolled,
		})
		.from(usersTable)
		.where(and(eq(usersTable.role, 'student'), eq(usersTable.enrolled, true)))
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

async function setPreferredNames(students: Student[]) {
	const zids = students.map((student) => student.zid).join(' ');

	let stdout: string;
	try {
		stdout = await executeCommand(`acc format='$CN\t$PREF' ${zids}`);
	} catch {
		process.exit(1);
	}

	// stdout is expected to contain lines in the format:
	// z5555555 John Doe
	const nameMap = new Map(
		stdout
			.replace(/\n$/, '')
			.split('\n')
			.map((line) => {
				const [zid, name] = line.split('\t');
				if (!zid || !name) {
					logger.error(`Failed to parse zID and name from line: ${line}`);
					process.exit(1);
				}
				return [zid, name];
			}),
	);

	students.forEach((student) => {
		if (nameMap.has(student.zid)) {
			student.name = nameMap.get(student.zid)!;
		}
	});
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
				dbStudents[i].classCode !== sourceStudents[j].classCode
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
