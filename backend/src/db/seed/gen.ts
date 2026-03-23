import util from 'util';

import { faker } from '@faker-js/faker';

import type { UserRole } from '@workspace/types/users';

import type { classesTable, usersTable } from '@/db/db';
import type { Time } from '@/types/time';

faker.seed(1);

function main() {
	util.inspect.defaultOptions.maxArrayLength = null;

	const classes = genClasses();
	console.log(classes);

	const users = genUsers(
		{ numAdmins: 5, numTutors: 25, numStudents: 1000 },
		classes,
	);
	console.log(users);
}

////////////////////////////////////////////////////////////////////////////////

export function genClasses(): (typeof classesTable.$inferInsert)[] {
	const days: [number, string][] = [
		[1, 'M'],
		[2, 'T'],
		[3, 'W'],
		[4, 'H'],
		[5, 'F'],
		[6, 'S'],
		[7, 'U'],
	];

	// prettier-ignore
	const labs = [
		'Strings', 'Flute', 'Oboe', 'Brass', 'Sitar', 'Kora',
		'Bongo', 'Tabla', 'Clavier', 'Organ', 'Piano',
		'Alto', 'Bass', 'Lute', 'Pipa', 'Harp',
		'Online',
	];
	let labIndex = 0;

	const classes = [];
	for (const [dayOfWeek, letter] of days) {
		for (let i = 0; i <= 22; ++i) {
			const startHour = i.toString().padStart(2, '0');
			const endHour = (i + 2).toString().padStart(2, '0');

			const lab = labs[labIndex];
			classes.push({
				code: `${letter}${startHour}A`,
				dayOfWeek,
				labStartTime: `${startHour}:00` as Time,
				labEndTime: `${endHour}:00` as Time,
				labLocation: lab === 'Online' ? 'Online' : `${lab} Lab`,
			});

			labIndex = (labIndex + 1) % labs.length;
		}
	}

	return classes;
}

////////////////////////////////////////////////////////////////////////////////

export function genUsers(
	{
		numAdmins,
		numTutors,
		numStudents,
	}: {
		numAdmins: number;
		numTutors: number;
		numStudents: number;
	},
	classes: (typeof classesTable.$inferInsert)[],
): (typeof usersTable.$inferInsert)[] {
	const classCodes = classes.map((cls) => cls.code);

	const admins = doGenUsers(numAdmins, 6000000, 'admin');
	const tutors = doGenUsers(numTutors, 7000000, 'tutor');
	const students = doGenUsers(numStudents, 8000000, 'student', classCodes);

	return [...admins, ...tutors, ...students];
}

function doGenUsers(
	numUsers: number,
	baseZid: number,
	role: UserRole,
	classCodes?: string[],
) {
	let classIndex = 0;

	const names = faker.helpers.uniqueArray(
		() => `${faker.person.firstName()} ${faker.person.lastName()}`,
		numUsers,
	);

	return names.map((name, i) => {
		const user = {
			zid: 'z' + (baseZid + i),
			name,
			role,
			classCode: classCodes?.[classIndex],
		};
		if (++classIndex >= (classCodes?.length ?? 0)) classIndex = 0;
		return user;
	});
}

////////////////////////////////////////////////////////////////////////////////

if (require.main === module) {
	main();
}
