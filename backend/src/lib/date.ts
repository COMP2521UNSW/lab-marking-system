import { format, getISODay, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import type { Time } from '@/types/time';

export const TIME_ZONE = process.env.LOCAL_TIME_ZONE || 'Australia/Sydney';

function toLocalDayAndTime(date: Date, timeZone = TIME_ZONE) {
	const zonedDate = toZonedTime(date, timeZone);
	return {
		day: getISODay(zonedDate),
		time: format(zonedDate, 'HH:mm') as Time,
	};
}

function toLocalStartOfDay(date: Date, timeZone = TIME_ZONE) {
	return fromZonedTime(startOfDay(toZonedTime(date, timeZone)), timeZone);
}

export { toLocalDayAndTime, toLocalStartOfDay };
