import '@/lib/polyfills/group-by';

import type { ClassesService } from '@workspace/types/services/classes';
import type { SessionUser } from '@workspace/types/users';

import { get } from '@/cache/cache';
import * as dbClasses from '@/db/classes';
import { toLocalDayAndTime } from '@/lib/date';
import { addMinutes, subtractMinutes } from '@/lib/time';
import timeService from '@/services/time';
import type { Time } from '@/types/time';
import type { BackendService } from '@/types/utils';

import { toClassList } from './utils/mappers';

////////////////////////////////////////////////////////////////////////////////

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

const classesService: BackendService<ClassesService> =
	new BackendClassesService();

export default classesService;

////////////////////////////////////////////////////////////////////////////////

export async function getActiveClassesForStudent() {
	const classes = await getAllActiveClasses();

	// Students can only see current and upcoming classes
	return {
		current: classes.current,
		upcoming: classes.upcoming,
		recent: [],
	};
}

export async function getActiveClassesForTutor() {
	return await getAllActiveClasses();
}

/**
 * Active classes include current classes, classes which are starting soon
 * (in < 15 minutes) and classes which have ended recently (up to 1 hour ago)
 */
async function getAllActiveClasses() {
	const date = timeService.getCurrentTime();

	const { day, time } = toLocalDayAndTime(date);

	return await get(
		`getClassesByTime:${day}:${time}`,
		() => getClassesByTime(day, time),
		60,
	);
}

async function getClassesByTime(localDay: number, localTime: Time) {
	if (!(await timeService.termInProgress())) {
		return {
			current: [],
			upcoming: [],
			recent: [],
		};
	}

	return await getClassesByDayAndTime(localDay, localTime);
}

async function getClassesByDayAndTime(day: number, time: Time) {
	const upcomingTime = addMinutes(time, 15);
	const recentTime = subtractMinutes(time, 60);

	const classes = await dbClasses.getClassesByDay(day);

	const groupedClasses = Object.groupBy(classes, (cls) => {
		if (time >= cls.labStartTime && time < cls.labEndTime) {
			return 'current';
		}

		if (upcomingTime >= cls.labStartTime && upcomingTime < cls.labEndTime) {
			return 'upcoming';
		}

		if (recentTime >= cls.labStartTime && recentTime < cls.labEndTime) {
			return 'recent';
		}

		return 'other';
	});

	return {
		current: toClassList(groupedClasses.current ?? []),
		upcoming: toClassList(groupedClasses.upcoming ?? []),
		recent: toClassList(groupedClasses.recent ?? []),
	};
}
