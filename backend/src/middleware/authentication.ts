import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import type { SessionUser } from '@workspace/types/users';

type Cookies = {
	token?: string;
};

const parseToken: RequestHandler = (req, res, next) => {
	// Necessary to avoid type error
	const cookies = req.cookies as Cookies;
	const token = cookies.token;

	if (!token) {
		req.maybeUser = null;
		return next();
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET!);

		// payload is guaranteed to satisfy SessionUser due to logIn() in
		// src/controllers/auth.ts
		req.maybeUser = payload as SessionUser;
	} catch {
		req.maybeUser = null;
	}

	next();
};

const requireLogin: RequestHandler = (req, res, next) => {
	if (!req.maybeUser) {
		return res.sendStatus(401);
	}

	req.user = req.maybeUser;
	next();
};

export { parseToken, requireLogin };
