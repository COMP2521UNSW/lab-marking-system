import express from 'express';

import * as classesController from '@/controllers/classes';
import { requireLogin } from '@/middleware/authentication';
import { requireTutor } from '@/middleware/authorisation';

const router = express.Router();

router.get(
	'/classes/all', //
	requireLogin,
	requireTutor,
	classesController.getAllClasses,
);

router.get(
	'/classes/active', //
	requireLogin,
	classesController.getActiveClasses,
);

export { router };
