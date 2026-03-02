import express from 'express';

import * as authController from '@/controllers/auth';
import { requireLogin } from '@/middleware/authentication';

const router = express.Router();

router.post(
	'/login', //
	authController.logIn,
);

router.post(
	'/logout', //
	requireLogin,
	authController.logOut,
);

router.get(
	'/user', //
	authController.getUser,
);

export { router };
