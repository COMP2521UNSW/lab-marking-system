import { format, getISODay, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { LOCAL_TIME_ZONE } from '@workspace/config';

import type { Time } from '@/types/time';

function toLocalDate(date: Date, timeZone: string = LOCAL_TIME_ZONE) {
	return toZonedTime(date, timeZone);
}

function toLocalDayAndTime(date: Date, timeZone: string = LOCAL_TIME_ZONE) {
	const zonedDate = toZonedTime(date, timeZone);
	return {
		day: getISODay(zonedDate),
		time: format(zonedDate, 'HH:mm') as Time,
	};
}

function toLocalStartOfDay(date: Date, timeZone: string = LOCAL_TIME_ZONE) {
	return fromZonedTime(startOfDay(toZonedTime(date, timeZone)), timeZone);
}

export { toLocalDate, toLocalDayAndTime, toLocalStartOfDay };
