import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { Temporal } from 'temporal-polyfill';

import { LOCAL_TIME_ZONE } from '@workspace/config';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

function formatTimestamp(timestamp: Temporal.Instant) {
	return dayjs
		.tz(timestamp.epochMilliseconds, LOCAL_TIME_ZONE)
		.format('dddd Do MMMM h:mma');
}

export { formatTimestamp };
