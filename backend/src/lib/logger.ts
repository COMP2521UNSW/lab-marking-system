import path from 'path';
import { addColors, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

import type { SessionUser } from '@workspace/types/users';

const logger = createLogger({
	format: format.combine(
		format.timestamp(),
		format.printf((info) => {
			const user = info.user as SessionUser | undefined;
			const data = info.data as object | undefined;
			return (
				`[${info.timestamp as string}]` +
				(user ? `[${user.zid}]` : '') +
				` ${info.level}: ${info.message as string}` +
				(data ? ` (${JSON.stringify(data)})` : '')
			);
		}),
	),
	transports: [
		new transports.Console({
			level: 'debug',
			format: format.combine(
				process.env.WINSTON_COLOUR !== 'false'
					? format.colorize()
					: format.simple(),
				format.timestamp(),
				format.printf((info) => {
					const user = info.user as SessionUser | undefined;
					const data = info.data as object | undefined;
					return (
						`[${info.timestamp as string}]` +
						(user ? `[${user.zid}]` : '') +
						` ${info.level}: ${info.message as string}` +
						(data ? ` (${JSON.stringify(data)})` : '')
					);
				}),
			),
		}),
		new transports.DailyRotateFile({
			level: 'info',
			filename: path.join('instance', 'logs', 'app', '%DATE%.log'),
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
