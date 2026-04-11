import path from 'path';

import { rootDir } from '@@/path-config';

export interface LoggingConfig {
	outputStream:
		| {
				type: 'stdout';
		  }
		| {
				type: 'file';
				path: string;
		  };
	useRealIpHeader: boolean;
}

const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT_NAME;

export const loggingConfig: LoggingConfig = {
	outputStream: IS_RAILWAY
		? { type: 'stdout' }
		: {
				type: 'file',
				path: path.join(rootDir, 'logs/access.log'),
			},

	useRealIpHeader: IS_RAILWAY,
};
