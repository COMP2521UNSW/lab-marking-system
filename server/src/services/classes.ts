import { addMinutes, format, getISODay, subMinutes } from 'date-fns';

import { get } from '@/db/cache';
import * as dbClasses from '@/db/classes';
import * as dbSettings from '@/db/settings';
import '@/lib/polyfills/group-by';
import type {
	GetActiveClassesResponseData,
	GetAllClassesResponseData,
} from '@/types/services/classes';
import type { SessionUser } from '@/types/users';

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
	const now = getCurrentTime();

	const day = getISODay(now);
	const time = format(now, 'HH:mm');

	return await get(
		`classes?day=${day}&time=${time}`,
		() => doGetAllActiveClasses(now),
		60,
	);
}

async function doGetAllActiveClasses(date: Date) {
	if (!(await termInProgress(date))) {
		return {
			current: [],
			upcoming: [],
			recent: [],
		};
	}

	const day = getISODay(date);

	const time = format(date, 'HH:mm');

	const upcomingTime = format(addMinutes(date, 15), 'HH:mm');
	const recentTime = format(subMinutes(date, 60), 'HH:mm');

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

	return date >= startDate && date <= endDate;
}
