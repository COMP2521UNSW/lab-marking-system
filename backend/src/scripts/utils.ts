import { exec } from 'child_process';

import { logger } from '@/lib/logger';

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

/**
 * Attempts to decode an error into a string to be logged
 * @param err error to be decoded
 */
export const parseError = (err: unknown): string => {
	if (err instanceof Error) {
		return err.message;
	} else if (typeof err === 'string') {
		return err;
	}
	return JSON.stringify(err);
};
