import express from 'express';

import * as activitiesController from '@/controllers/activities';
import { requireLogin } from '@/middleware/authentication';
import { requireTutor } from '@/middleware/authorisation';

const router = express.Router();

router.get(
	'/activities/all', //
	requireLogin,
	requireTutor,
	activitiesController.getAllActivities,
);

router.get(
	'/activities/active', //
	requireLogin,
	activitiesController.getActiveActivitiesForUser,
);

export { router };
