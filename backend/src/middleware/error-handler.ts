import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
} from '@/lib/errors';
import { logger } from '@/lib/logger';

const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
	if (err instanceof ZodError) {
		res.sendStatus(400);
	} else if (err instanceof BadRequestError) {
		logger.log(err.logLevel, err.message, { user: req.user });
		res.status(400).json({ message: err.message });
	} else if (err instanceof UnauthorizedError) {
		res.status(401).json({ message: err.message });
	} else if (err instanceof ForbiddenError) {
		res.status(403).json({ message: err.message });
	} else if (err instanceof InternalServerError) {
		logger.log(err.logLevel, err.message, { user: req.user });
		res.status(500).json({ message: err.message });
	} else {
		logger.error(err.message);
		res.sendStatus(500);
	}
};

export { errorHandler };
