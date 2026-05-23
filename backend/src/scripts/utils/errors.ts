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
