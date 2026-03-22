import '@/lib/polyfills/group-by';

import { addDays } from 'date-fns';

import type { ClassesService } from '@workspace/types/services/classes';
import type { SessionUser } from '@workspace/types/users';

import { get } from '@/cache/cache';
import * as dbClasses from '@/db/classes';
import * as dbSettings from '@/db/settings';
import { toLocalDayAndTime } from '@/lib/date';
import { addMinutes, subtractMinutes } from '@/lib/time';
import type { Time } from '@/types/time';
import type { BackendService } from '@/types/utils';

import { getCurrentTime } from './utils';

////////////////////////////////////////////////////////////////////////////////

class BackendClassesService implements BackendService<ClassesService> {
	async getAllClasses(user: SessionUser) {
		return await dbClasses.getAllClasses();
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
	const date = getCurrentTime();

	const { day, time } = toLocalDayAndTime(date);

	return await get(
		`getClassesByTime:${day}:${time}`,
		() => getClassesByTime(date, day, time),
		60,
	);
}

async function getClassesByTime(date: Date, localDay: number, localTime: Time) {
	if (!(await termInProgress(date))) {
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
		current: groupedClasses.current ?? [],
		upcoming: groupedClasses.upcoming ?? [],
		recent: groupedClasses.recent ?? [],
	};
}

////////////////////////////////////////////////////////////////////////////////

async function termInProgress(date: Date) {
	const { startDate, endDate } = await dbSettings.getTermDates();

	// endDate is inclusive, so add 1 day before comparing
	return date >= startDate && date < addDays(endDate, 1);
}
