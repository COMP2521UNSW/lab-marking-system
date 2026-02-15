import type { Request } from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

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
