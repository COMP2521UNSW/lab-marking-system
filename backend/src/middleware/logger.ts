import fs from 'fs';
import path from 'path';

import type { Request } from 'express';
import morgan from 'morgan';

const logStream = fs.createWriteStream(
	path.join('instance', 'logs', 'requests.log'),
	{
		flags: 'a',
	},
);

morgan.token('user', (req: Request) =>
	req.maybeUser ? req.maybeUser.zid : 'anonymous',
);

const logger = morgan(
	'[:date[iso]] :remote-addr :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	{ stream: logStream },
);

export { logger };
