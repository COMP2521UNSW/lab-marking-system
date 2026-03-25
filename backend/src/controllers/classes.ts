import type { RequestHandler } from 'express';

import classesService from '@/services/classes';

////////////////////////////////////////////////////////////////////////////////

const getAllClasses: RequestHandler = async (req, res) => {
	const classes = await classesService.getAllClasses(req.user);
	res.status(200).json(classes);
};

////////////////////////////////////////////////////////////////////////////////

const getActiveClasses: RequestHandler = async (req, res) => {
	const classes = await classesService.getActiveClasses(req.user);
	res.status(200).json(classes);
};

////////////////////////////////////////////////////////////////////////////////

export { getActiveClasses, getAllClasses };
