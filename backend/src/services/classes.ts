import { addDays } from 'date-fns';

import type {
	GetActiveClassesResponseData,
	GetAllClassesResponseData,
} from '@workspace/types/services/classes';
import type { SessionUser } from '@workspace/types/users';

import * as dbClasses from '@/db/classes';
import * as dbSettings from '@/db/settings';
import { get } from '@/lib/cache';
import { toLocalDayAndTime } from '@/lib/date';
import '@/lib/polyfills/group-by';
import { addMinutes, subtractMinutes } from '@/lib/time';
import type { Time } from '@/types/time';

import { getCurrentTime } from './utils';

////////////////////////////////////////////////////////////////////////////////

export async function getAllClasses(
	user: SessionUser, //
): Promise<GetAllClassesResponseData> {
	return await dbClasses.getAllClasses();
}

////////////////////////////////////////////////////////////////////////////////

export async function getActiveClasses(
	user: SessionUser, //
): Promise<GetActiveClassesResponseData> {
	if (user.role === 'student') {
		return await getActiveClassesForStudent();
	} else {
		return await getActiveClassesForTutor();
	}
}

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
		`classes?day=${day}&time=${time}`,
		() => getClassesByDate(date, day, time),
		60,
	);
}

async function getClassesByDate(date: Date, localDay: number, localTime: Time) {
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
