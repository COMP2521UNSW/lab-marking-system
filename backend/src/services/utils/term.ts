import { Temporal } from 'temporal-polyfill';

import type { Time } from '@workspace/types/time';

import * as dbSettings from '@/db/settings';
import { formatTime } from '@/lib/date';

import { now } from './date-time';

export type TermDate = {
	week: number;
	day: number;
	time: Time;
};

export async function getTermDate(
	dateTime?: Temporal.ZonedDateTime,
): Promise<TermDate> {
	dateTime ??= now();

	const week = await getCurrentWeek(dateTime);

	return {
		week,
		day: dateTime.dayOfWeek,
		time: formatTime(dateTime),
	};
}

export async function getCurrentWeek(dateTime?: Temporal.ZonedDateTime) {
	dateTime ??= now();

	const { startDate } = await dbSettings.getTermDates();

	if (Temporal.PlainDate.compare(dateTime, startDate) < 0) {
		return 0;
	} else {
		return 1 + startDate.until(dateTime, { smallestUnit: 'weeks' }).weeks;
	}
}

export async function termInProgress(dateTime?: Temporal.ZonedDateTime) {
	dateTime ??= now();

	const { startDate, endDate } = await dbSettings.getTermDates();

	return (
		Temporal.PlainDate.compare(dateTime, startDate) >= 0 &&
		Temporal.PlainDate.compare(dateTime, endDate) <= 0
	);
}
