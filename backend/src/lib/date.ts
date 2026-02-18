import { format, getISODay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import type { Time } from '@/types/time';

const TIME_ZONE = process.env.LOCAL_TIME_ZONE || 'Australia/Sydney';

function toLocalDayAndTime(date: Date) {
	const zonedDate = toZonedTime(date, TIME_ZONE);
	return {
		day: getISODay(zonedDate),
		time: format(zonedDate, 'HH:mm') as Time,
	};
}

export { toLocalDayAndTime };
