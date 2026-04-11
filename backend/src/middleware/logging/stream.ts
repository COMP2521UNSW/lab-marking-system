import fs from 'fs';

import { loggingConfig } from './config';

export const getLogStream = () => {
	if (loggingConfig.outputStream.type === 'stdout') {
		return process.stdout;
	} else {
		return fs.createWriteStream(loggingConfig.outputStream.path, {
			flags: 'a',
		});
	}
};
