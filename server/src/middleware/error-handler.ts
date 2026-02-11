import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
} from '@/lib/errors';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (err instanceof ZodError) {
		res.sendStatus(400);
	} else if (err instanceof BadRequestError) {
		res.status(400).json({ message: err.message });
	} else if (err instanceof UnauthorizedError) {
		res.status(401).json({ message: err.message });
	} else if (err instanceof ForbiddenError) {
		res.status(403).json({ message: err.message });
	} else if (err instanceof InternalServerError) {
		res.status(500).json({ message: err.message });
	} else {
		res.sendStatus(500);
	}
};

export { errorHandler };
