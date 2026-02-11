// import { db } from '@/db/db';
// import { usersTable } from '@/db/schema/schema';
// import { logger } from '@/lib/logger';

import { executeCommand } from './utils';

const COURSE_CODE = 'COMP2521';
const TERM = '26T1';

export async function addStudents() {
	const students = await getEnrollments();

	void students;
}

async function getEnrollments() {
	const output = await executeCommand(
		`grep "^${COURSE_CODE}" ~teachadmin/lib/enrollments/${TERM}_COMP | cut -f2,3,10 -d'|'`,
	);

	const lines = output.split('\n');
	const students = lines.map((line) => {
		const [zid, name, cseClassCode] = line.split('|');
		return {
			zid: `z${zid}`,
			name: name.split(', ').toReversed().join(' '),
			cseClassCode,
		};
	});

	return students;
}
