import type { RequestHandler } from 'express';
import z from 'zod';

import { numberSchema } from '@/lib/schemas';
import requestsService from '@/services/requests';

////////////////////////////////////////////////////////////////////////////////

const getActiveRequestsForCurrentUser: RequestHandler = async (req, res) => {
	const requests = await requestsService.getActiveRequestsForCurrentUser(
		req.user,
	);
	res.status(200).json(requests);
};

////////////////////////////////////////////////////////////////////////////////

const updateRequestsSchema = z
	.object({
		body: z.object({
			classCode: z.string(),
			activityCodes: z.array(z.string()),
		}),
	})
	.transform((data) => data.body);

const updateRequests: RequestHandler = async (req, res) => {
	const reqData = updateRequestsSchema.parse(req);
	await requestsService.updateRequests(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const withdrawRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
		body: z.object({
			reason: z.string(),
		}),
	})
	.transform((data) => ({
		id: data.params.id,
		reason: data.body.reason,
	}));

const withdrawRequest: RequestHandler = async (req, res) => {
	const reqData = withdrawRequestSchema.parse(req);
	await requestsService.withdrawRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const getRequestsByClassSchema = z
	.object({
		query: z.object({
			classCode: z.string(),
		}),
	})
	.transform((data) => ({
		classCode: data.query.classCode,
	}));

const getRequestsByClass: RequestHandler = async (req, res) => {
	const reqData = getRequestsByClassSchema.parse(req);
	const requests = await requestsService.getRequestsByClass(req.user, reqData);
	res.status(200).json(requests);
};

////////////////////////////////////////////////////////////////////////////////

const claimRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
	})
	.transform((data) => data.params);

const claimRequest: RequestHandler = async (req, res) => {
	const reqData = claimRequestSchema.parse(req);
	await requestsService.claimRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const unclaimRequestSchema = claimRequestSchema;

const unclaimRequest: RequestHandler = async (req, res) => {
	const reqData = unclaimRequestSchema.parse(req);
	await requestsService.unclaimRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const declineRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
		body: z.object({
			reason: z.string(),
		}),
	})
	.transform((data) => ({
		id: data.params.id,
		reason: data.body.reason,
	}));

const declineRequest: RequestHandler = async (req, res) => {
	const reqData = declineRequestSchema.parse(req);
	await requestsService.declineRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const markRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
		body: z.object({
			mark: z.number(),
		}),
	})
	.transform((data) => ({
		id: data.params.id,
		mark: data.body.mark,
	}));

const markRequest: RequestHandler = async (req, res) => {
	const reqData = markRequestSchema.parse(req);
	await requestsService.markRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const amendMarkSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
		body: z.object({
			mark: z.number(),
		}),
	})
	.transform((data) => ({
		id: data.params.id,
		mark: data.body.mark,
	}));

const amendMark: RequestHandler = async (req, res) => {
	const reqData = amendMarkSchema.parse(req);
	await requestsService.amendMark(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const createManualRequestSchema = z
	.object({
		body: z.object({
			studentZid: z.string(),
			activityCode: z.string(),
			reason: z.string(),
			mark: z.number(),
		}),
	})
	.transform((data) => data.body);

const createManualRequest: RequestHandler = async (req, res) => {
	const reqData = createManualRequestSchema.parse(req);
	await requestsService.createManualRequest(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

const getAllManualRequests: RequestHandler = async (req, res) => {
	const requests = await requestsService.getAllManualRequests(req.user);
	res.status(200).json(requests);
};

////////////////////////////////////////////////////////////////////////////////

const approveManualRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
	})
	.transform((data) => ({
		id: data.params.id,
	}));

const approveManualRequest: RequestHandler = async (req, res) => {
	const reqData = approveManualRequestSchema.parse(req);
	const manualRequest = await requestsService.approveManualRequest(
		req.user,
		reqData,
	);
	res.status(200).json(manualRequest);
};

////////////////////////////////////////////////////////////////////////////////

const denyManualRequestSchema = z
	.object({
		params: z.object({
			id: numberSchema,
		}),
		body: z.object({
			reason: z.string(),
		}),
	})
	.transform((data) => ({
		id: data.params.id,
		reason: data.body.reason,
	}));

const denyManualRequest: RequestHandler = async (req, res) => {
	const reqData = denyManualRequestSchema.parse(req);
	const manualRequest = await requestsService.denyManualRequest(
		req.user,
		reqData,
	);
	res.status(200).json(manualRequest);
};

////////////////////////////////////////////////////////////////////////////////

export {
	amendMark,
	approveManualRequest,
	claimRequest,
	createManualRequest,
	declineRequest,
	denyManualRequest,
	getActiveRequestsForCurrentUser,
	getAllManualRequests,
	getRequestsByClass,
	markRequest,
	unclaimRequest,
	updateRequests,
	withdrawRequest,
};
