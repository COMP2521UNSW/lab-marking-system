import type { CookieOptions, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';

import { devMode } from '@/lib/utils';
import authService from '@/services/auth';

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: !devMode(),
	sameSite: 'strict',
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

	const dummyUser = { zid: 'z0000000', role: 'student' as const };
	const user = await authService.logIn(dummyUser, reqData);

	const accessToken = jwt.sign(user, process.env.JWT_SECRET!, {
		expiresIn: '30 days',
	});

	res.cookie('token', accessToken, cookieOptions).status(200).json(user);
};

////////////////////////////////////////////////////////////////////////////////

const logOut: RequestHandler = async (req, res) => {
	await authService.logOut(req.user);

	res.clearCookie('token', cookieOptions).sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const getUser: RequestHandler = async (req, res) => {
	const user = req.maybeUser && (await authService.getUser(req.maybeUser));

	res.status(200).json(user);
};

////////////////////////////////////////////////////////////////////////////////

export { getUser, logIn, logOut };
