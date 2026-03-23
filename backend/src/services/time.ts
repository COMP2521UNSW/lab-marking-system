import { addDays, differenceInWeeks, isBefore } from 'date-fns';

import * as dbSettings from '@/db/settings';
import { devMode } from '@/lib/utils';
import type { TimeService } from '@/types/services/time';

import fakeTimeService from './fake/time';

class BackendTimeService implements TimeService {
	getCurrentTime() {
		return new Date();
	}

	async getCurrentWeek() {
		const now = new Date();
		const { startDate } = await dbSettings.getTermDates();

		if (isBefore(now, startDate)) {
			return 0;
		} else {
			return 1 + differenceInWeeks(now, startDate);
		}
	}

	async termInProgress() {
		const date = new Date();
		const { startDate, endDate } = await dbSettings.getTermDates();

		// endDate is inclusive, so add 1 day before comparing
		return date >= startDate && date < addDays(endDate, 1);
	}
}

const timeService: TimeService = new BackendTimeService();

export default devMode() ? fakeTimeService : timeService;
