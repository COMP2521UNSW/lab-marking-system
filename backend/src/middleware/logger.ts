import fs from 'fs';
import path from 'path';

import { format } from 'date-fns';
import type { Request } from 'express';
import morgan from 'morgan';

import { toLocalDate } from '@/lib/date';
import { rootDir } from '@@/path-config';

const logStream = fs.createWriteStream(
	path.join(rootDir, 'logs', 'access.log'),
	{
		flags: 'a',
	},
);

morgan.token('date', () => {
	const date = toLocalDate(new Date());
	return format(date, 'yyyy-MM-dd hh:mm:ss');
});

morgan.token('user', (req: Request) =>
	req.maybeUser ? req.maybeUser.zid : 'anonymous',
);

const logger = morgan(
	'[:date] :remote-addr :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	{ stream: logStream },
);

export { logger };
