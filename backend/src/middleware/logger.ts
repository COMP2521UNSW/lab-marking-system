import fs from 'fs';
import path from 'path';

import type { Request } from 'express';
import morgan from 'morgan';
import { Temporal } from 'temporal-polyfill';

import { LOCAL_TIME_ZONE } from '@workspace/config';

import { formatDateTime } from '@/lib/date';
import { rootDir } from '@@/path-config';

const logStream = fs.createWriteStream(
	path.join(rootDir, 'logs', 'access.log'),
	{
		flags: 'a',
	},
);

morgan.token('date', () => {
	const date = Temporal.Now.zonedDateTimeISO(LOCAL_TIME_ZONE);
	return formatDateTime(date);
});

morgan.token('user', (req: Request) =>
	req.maybeUser ? req.maybeUser.zid : 'anonymous',
);

const logger = morgan(
	'[:date] :remote-addr :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	{ stream: logStream },
);

export { logger };
