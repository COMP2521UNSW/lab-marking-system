import { addDays, differenceInWeeks, isBefore } from 'date-fns';

import type { Time } from '@workspace/types/time';

import * as dbSettings from '@/db/settings';
import { toLocalDayAndTime } from '@/lib/date';

import { getDate } from './time';

export type TermDate = {
	week: number;
	day: number;
	time: Time;
};

export async function getTermDate(date?: Date): Promise<TermDate> {
	date ??= getDate();

	const week = await getCurrentWeek(date);
	const { day, time } = toLocalDayAndTime(date);
	return { week, day, time };
}

export async function getCurrentWeek(date?: Date) {
	date ??= getDate();
	const { startDate } = await dbSettings.getTermDates();

	if (isBefore(date, startDate)) {
		return 0;
	} else {
		return 1 + differenceInWeeks(date, startDate);
	}
}

export async function termInProgress(date?: Date) {
	date ??= getDate();
	const { startDate, endDate } = await dbSettings.getTermDates();

	// endDate is inclusive, so add 1 day before comparing
	return date >= startDate && date < addDays(endDate, 1);
}
