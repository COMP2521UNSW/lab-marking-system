import { addDays, differenceInWeeks, isBefore } from 'date-fns';

import * as dbSettings from '@/db/settings';

import { getDate } from './time';

export async function getCurrentWeek() {
	const now = getDate();
	const { startDate } = await dbSettings.getTermDates();

	if (isBefore(now, startDate)) {
		return 0;
	} else {
		return 1 + differenceInWeeks(now, startDate);
	}
}

export async function termInProgress() {
	const now = getDate();
	const { startDate, endDate } = await dbSettings.getTermDates();

	// endDate is inclusive, so add 1 day before comparing
	return now >= startDate && now < addDays(endDate, 1);
}
