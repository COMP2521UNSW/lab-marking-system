import type { RequestHandler } from 'express';

import { isAdmin, isTutor } from '@/lib/roles';

const requireAdmin: RequestHandler = (req, res, next) => {
	if (!isAdmin(req.user.role)) {
		return res.sendStatus(403);
	}
	next();
};

const requireTutor: RequestHandler = (req, res, next) => {
	if (!isTutor(req.user.role)) {
		return res.sendStatus(403);
	}
	next();
};

export { requireAdmin, requireTutor };
