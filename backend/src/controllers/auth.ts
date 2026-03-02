import type { CookieOptions, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';

import * as authService from '@/services/auth';

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'none',
	partitioned: true,
};

////////////////////////////////////////////////////////////////////////////////

const logInSchema = z
	.object({
		body: z.object({
			zid: z.string(),
			password: z.string(),
		}),
	})
	.transform((data) => data.body);

const logIn: RequestHandler = async (req, res) => {
	const reqData = logInSchema.parse(req);
	const user = await authService.logIn(reqData);

	const accessToken = jwt.sign(user, process.env.JWT_SECRET!, {
		expiresIn: '30 days',
	});

	res.cookie('token', accessToken, cookieOptions).status(200).json(user);
};

////////////////////////////////////////////////////////////////////////////////

const logOut: RequestHandler = (req, res) => {
	authService.logOut(req.user);
	res.clearCookie('token', cookieOptions).sendStatus(200);
};

////////////////////////////////////////////////////////////////////////////////

const getUser: RequestHandler = async (req, res) => {
	const user = await authService.getUser(req.maybeUser);
	res.status(200).json(user);
};

////////////////////////////////////////////////////////////////////////////////

export { getUser, logIn, logOut };
