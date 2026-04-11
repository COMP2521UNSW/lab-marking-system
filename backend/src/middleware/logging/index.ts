import morgan from 'morgan';

import { logFormat } from './format';
import { getLogStream } from './stream';
import { registerTokens } from './tokens';

registerTokens();

export const logger = morgan(logFormat, {
	stream: getLogStream(),
});
