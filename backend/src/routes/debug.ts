import express from 'express';

import * as debugController from '@/controllers/debug';
import { requireLogin } from '@/middleware/authentication';

const router = express.Router();

router.post(
	'/debug', //
	requireLogin,
	debugController.debug,
);

export { router };
