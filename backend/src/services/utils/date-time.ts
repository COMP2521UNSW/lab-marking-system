import { Temporal } from 'temporal-polyfill';

import { LOCAL_TIME_ZONE } from '@workspace/config';

import { devMode } from '@/lib/utils';

const FAKE_DATE_TIME = Temporal.ZonedDateTime.from({
	year: 2026,
	month: 4,
	day: 2,
	hour: 16,
	minute: 50,
	timeZone: LOCAL_TIME_ZONE,
});

export function now() {
	return devMode()
		? FAKE_DATE_TIME
		: Temporal.Now.zonedDateTimeISO(LOCAL_TIME_ZONE);
}
