import { exec } from 'child_process';

import { logger } from '@/lib/logger';

import { parseError } from './errors';

export const executeCommand = (
	command: string,
	printError = true,
	append = '',
) => {
	logger.info(`${append !== '' ? append + ' ' : ''}Executing: '${command}'`);
	return new Promise<string>((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) {
				if (printError) {
					logger.error(`Error with command: ${command}. ${parseError(err)}`);
				}
				reject(err);
			}
			resolve(stdout);
		});
	});
};
