import { Temporal } from 'temporal-polyfill';

import { LOCAL_TIME_ZONE } from '@workspace/config';
import type { Time } from '@workspace/types/time';

function formatTime(date: Temporal.ZonedDateTime) {
	const hour = date.hour.toString().padStart(2, '0');
	const minute = date.minute.toString().padStart(2, '0');
	return `${hour}:${minute}` as Time;
}

function formatDateTime(date: Temporal.ZonedDateTime) {
	const year = date.year;
	const month = date.month.toString().padStart(2, '0');
	const day = date.day.toString().padStart(2, '0');
	const hour = date.hour.toString().padStart(2, '0');
	const minute = date.minute.toString().padStart(2, '0');
	const second = date.second.toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function isToday(timestamp: Temporal.Instant) {
	const today = Temporal.Now.plainDateISO(LOCAL_TIME_ZONE);
	return timestamp
		.toZonedDateTimeISO(LOCAL_TIME_ZONE)
		.toPlainDate()
		.equals(today);
}

export { formatTime, formatDateTime, isToday };
