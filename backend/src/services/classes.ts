import '@/lib/polyfills/group-by';

import { format } from 'date-fns';

import type { ClassDetails } from '@workspace/types/classes';
import type { ClassesService } from '@workspace/types/services/classes';
import type { SessionUser } from '@workspace/types/users';

import { get } from '@/cache/cache';
import * as dbClasses from '@/db/classes';
import type { BackendService } from '@/types/utils';

import { getClassState } from './utils/classes';
import { toClassList } from './utils/mappers';
import { getTermDate, termInProgress } from './utils/term';
import { getDate } from './utils/time';

class BackendClassesService implements BackendService<ClassesService> {
	async getAllClasses(user: SessionUser) {
		const classes = await dbClasses.getAllClasses();

		return toClassList(classes);
	}

	async getActiveClasses(user: SessionUser) {
		if (user.role === 'student') {
			return await getActiveClassesForStudent();
		} else {
			return await getActiveClassesForTutor();
		}
	}
}

////////////////////////////////////////////////////////////////////////////////

export async function classIsOpen(classDetails: ClassDetails) {
	const classes = await getActiveClasses();

	return classes.current.some((cls) => cls.code === classDetails.code);
}

export async function getActiveClassesForStudent() {
	const classes = await getActiveClasses();

	// Students can only see current and upcoming classes
	return {
		current: classes.current,
		upcoming: classes.upcoming,
		recent: [],
	};
}

export async function getActiveClassesForTutor() {
	return await getActiveClasses();
}

/**
 * Active classes include current classes, classes which are starting soon
 * (in < 15 minutes) and classes which have ended recently (up to 1 hour ago)
 */
async function getActiveClasses() {
	const date = getDate();

	return await get(
		// we can key by HH:mm because TTL is 1 minute
		`getActiveClasses:${format(date, 'HH:mm')}`,
		() => getActiveClassesByTime(date),
		60,
	);
}

async function getActiveClassesByTime(date: Date) {
	if (!(await termInProgress(date))) {
		return {
			current: [],
			upcoming: [],
			recent: [],
		};
	}

	const classes = await dbClasses.getAllClasses();

	const termDate = await getTermDate(date);

	const groupedClasses = Object.groupBy(classes, (cls) =>
		getClassState(cls, termDate),
	);

	return {
		current: toClassList(groupedClasses.current ?? []),
		upcoming: toClassList(groupedClasses.upcoming ?? []),
		recent: toClassList(groupedClasses.recent ?? []),
	};
}

////////////////////////////////////////////////////////////////////////////////

const classesService: BackendService<ClassesService> =
	new BackendClassesService();

export default classesService;
