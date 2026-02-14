import { differenceInWeeks, isBefore } from 'date-fns';

import * as dbSettings from '@/db/settings';
import { devMode } from '@/lib/utils';

import { BadRequestError, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { SessionUser } from '@/types/users';
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

function info(user: SessionUser | undefined, msg: string, data?: object) {
	logger.info(msg, { user, data });
}

function badRequestError(
	user: SessionUser,
	msg: string,
	logMsg?: string,
): never {
	logger.warn(logMsg ?? msg, { user });
	throw new BadRequestError(msg);
}

function internalServerError(
	user: SessionUser,
	msg: string,
	logMsg?: string,
): never {
	logger.error(logMsg ?? msg, { user });
	throw new InternalServerError(msg);
}

////////////////////////////////////////////////////////////////////////////////

export {
	badRequestError,
	getCurrentTime,
	getCurrentWeek,
	info,
	internalServerError,
};
