import { differenceInWeeks, isBefore } from 'date-fns';

import * as dbSettings from '@/db/settings';
import { devMode } from '@/lib/utils';

import * as fakeUtils from './fake/utils';

const inDevMode = devMode();

////////////////////////////////////////////////////////////////////////////////

const getCurrentTime = inDevMode
	? fakeUtils.fakeGetCurrentTime
	: () => new Date();

////////////////////////////////////////////////////////////////////////////////

const getCurrentWeek = inDevMode
	? fakeUtils.fakeGetCurrentWeek
	: async () => {
			const now = new Date();
			const { startDate } = await dbSettings.getTermDates();

			if (isBefore(now, startDate)) {
				return 0;
			} else {
				return 1 + differenceInWeeks(now, startDate);
			}
		};

////////////////////////////////////////////////////////////////////////////////

export { getCurrentTime, getCurrentWeek };
