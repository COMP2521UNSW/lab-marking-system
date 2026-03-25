import type { RequestHandler } from 'express';

import pagesService from '@/services/pages';

////////////////////////////////////////////////////////////////////////////////

const getStudentRequestsPage: RequestHandler = async (req, res) => {
	const pageData = await pagesService.getStudentRequestsPage(req.user);
	res.status(200).json(pageData);
};

////////////////////////////////////////////////////////////////////////////////

export { getStudentRequestsPage };
