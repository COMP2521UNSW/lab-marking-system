import path from 'path';

import { format as formatDate } from 'date-fns';
import { SPLAT } from 'triple-beam';
import { addColors, createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import type { SessionUser } from '@workspace/types/users';

import { toLocalDate } from '@/lib/date';
import { rootDir } from '@@/path-config';

type Meta = {
	user?: SessionUser;
} & Record<string, object>;

const timestampFormatter = format.timestamp({
	format: () => {
		const date = toLocalDate(new Date());
		return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
	},
});

const printfFormatter = format.printf((info) => {
	const splat = info[SPLAT] as Record<string, object>[] | undefined;
	const meta = (splat?.[0] ?? {}) as Meta;
	const { user, ...data } = meta;

	const segments = [
		`[${info.timestamp as string}]`,
		`${info.level}:`,
		user && `[${user.zid}]`,
		`${info.message as string}`,
		Object.keys(data).length > 0 &&
			`(${Object.values(data)
				.map((obj) => JSON.stringify(obj))
				.join(', ')})`,
	];

	return segments.filter(Boolean).join(' ');
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
		new DailyRotateFile({
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
