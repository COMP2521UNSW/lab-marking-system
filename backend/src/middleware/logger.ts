import { format } from 'date-fns';
import type { Request } from 'express';
import morgan from 'morgan';

import { toLocalDate } from '@/lib/date';

morgan.token('date', () => {
	const date = toLocalDate(new Date());
	return format(date, 'yyyy-MM-dd hh:mm:ss');
});

morgan.token('user', (req: Request) =>
	req.maybeUser ? req.maybeUser.zid : 'anonymous',
);

const logger = morgan(
	'[:date] :remote-addr :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
);

export { logger };
