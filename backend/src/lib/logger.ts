import path from 'path';

import { format as formatDate } from 'date-fns';
import { addColors, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

import type { SessionUser } from '@workspace/types/users';

import { toLocalDate } from '@/lib/date';
import { rootDir } from '@@/path-config';

const timestampFormatter = format.timestamp({
	format: () => {
		const date = toLocalDate(new Date());
		return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
	},
});

const printfFormatter = format.printf((info) => {
	const user = info.user as SessionUser | undefined;
	const data = info.data as object | undefined;
	return (
		`[${info.timestamp as string}]` +
		` ${info.level}: ` +
		(user ? `[${user.zid}] ` : '') +
		`${info.message as string}` +
		(data ? ` (${JSON.stringify(data)})` : '')
	);
});

const logger = createLogger({
	format: format.combine(timestampFormatter, printfFormatter),
	transports: [
		new transports.Console({
			level: 'debug',
			format: format.combine(
				process.env.WINSTON_COLOUR !== 'false'
					? format.colorize()
					: format.simple(),
				timestampFormatter,
				printfFormatter,
			),
		}),
		new transports.DailyRotateFile({
			level: 'info',
			filename: path.join(rootDir, 'logs', '%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
		}),
	],
});

addColors({
	error: 'red',
	warn: 'yellow',
	info: 'cyan',
	debug: 'green',
	verbose: 'green',
});

export { logger };
