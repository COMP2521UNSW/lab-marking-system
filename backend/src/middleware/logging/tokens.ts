import type { Request } from 'express';
import morgan from 'morgan';
import { Temporal } from 'temporal-polyfill';

import { LOCAL_TIME_ZONE } from '@workspace/config';

import { formatDateTime } from '@/lib/date';

import { loggingConfig } from './config';

export const registerTokens = () => {
	morgan.token('date', () => {
		const date = Temporal.Now.zonedDateTimeISO(LOCAL_TIME_ZONE);
		return formatDateTime(date);
	});

	morgan.token('user', (req: Request) =>
		req.maybeUser ? req.maybeUser.zid : 'anonymous',
	);

	morgan.token('client-ip', (req: Request) => {
		if (loggingConfig.useRealIpHeader) {
			const xRealIp = req.headers['x-real-ip'];
			if (xRealIp) {
				return Array.isArray(xRealIp) ? xRealIp.join(' ') : xRealIp;
			}
		}
		return req.ip;
	});
};
