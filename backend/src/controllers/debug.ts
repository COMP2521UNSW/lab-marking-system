import type { RequestHandler } from 'express';
import z from 'zod';

import debugService from '@/services/debug';

////////////////////////////////////////////////////////////////////////////////

const debugSchema = z
	.object({
		body: z.object({
			message: z.string(),
		}),
	})
	.transform((data) => data.body);

const debug: RequestHandler = async (req, res) => {
	const reqData = debugSchema.parse(req);
	await debugService.debug(req.user, reqData);
	res.sendStatus(204);
};

////////////////////////////////////////////////////////////////////////////////

export { debug };
