import express from 'express';

import * as requestsController from '@/controllers/requests';
import { requireLogin } from '@/middleware/authentication';
import { requireAdmin, requireTutor } from '@/middleware/authorisation';

const router = express.Router();

/* superseded by /pages/requests */
// router.get(
// 	'/requests/self', //
// 	requireLogin,
// 	requestsController.getActiveRequestsForCurrentUser,
// );

router.post(
	'/requests', //
	requireLogin,
	requestsController.updateRequests,
);

router.post(
	'/requests/:id/withdraw', //
	requireLogin,
	requestsController.withdrawRequest,
);

router.get(
	'/requests', //
	requireLogin,
	requireTutor,
	requestsController.getRequestsByClass,
);

router.post(
	'/requests/:id/decline', //
	requireLogin,
	requireTutor,
	requestsController.declineRequest,
);

router.post(
	'/requests/:id/mark', //
	requireLogin,
	requireTutor,
	requestsController.markRequest,
);

router.post(
	'/requests/:id/amend', //
	requireLogin,
	requireTutor,
	requestsController.amendMark,
);

router.post(
	'/requests/manual', //
	requireLogin,
	requireTutor,
	requestsController.createManualRequest,
);

router.get(
	'/requests/manual', //
	requireLogin,
	requireAdmin,
	requestsController.getAllManualRequests,
);

router.post(
	'/requests/manual/:id/approve', //
	requireLogin,
	requireAdmin,
	requestsController.approveManualRequest,
);

router.post(
	'/requests/manual/:id/deny', //
	requireLogin,
	requireAdmin,
	requestsController.denyManualRequest,
);

export { router };
