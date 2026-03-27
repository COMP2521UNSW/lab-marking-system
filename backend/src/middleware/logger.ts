import { format } from 'date-fns';
import type { Request } from 'express';
import morgan from 'morgan';

import { toLocalDate } from '@/lib/date';

morgan.token('date', () => {
	const date = toLocalDate(new Date());
	return format(date, 'yyyy-MM-dd HH:mm:ss');
});

morgan.token('client-ip', (req: Request) => {
	const xRealIp = req.headers['x-real-ip'];
	if (xRealIp) {
		return Array.isArray(xRealIp) ? xRealIp.join(' ') : xRealIp;
	}
	return req.ip;
});

morgan.token('user', (req: Request) =>
	req.maybeUser ? req.maybeUser.zid : 'anonymous',
);

const logger = morgan(
	'[:date] :client-ip :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
);

export { logger };
