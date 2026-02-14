import express from 'express';

import * as pagesController from '@/controllers/pages';
import { requireLogin } from '@/middleware/authentication';

const router = express.Router();

router.get(
	'/pages/requests', //
	requireLogin,
	pagesController.getStudentRequestsPage,
);

export { router };
