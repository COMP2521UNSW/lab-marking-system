import type { RequestHandler } from 'express';

import * as activitiesService from '@/services/activities';

////////////////////////////////////////////////////////////////////////////////

const getAllActivities: RequestHandler = async (req, res) => {
	const activities = await activitiesService.getAllActivities(req.user);
	res.status(200).json(activities);
};

////////////////////////////////////////////////////////////////////////////////

const getActiveActivitiesForUser: RequestHandler = async (req, res) => {
	const activities = await activitiesService.getActiveActivitiesForUser(
		req.user,
	);
	res.status(200).json(activities);
};

////////////////////////////////////////////////////////////////////////////////

export { getActiveActivitiesForUser, getAllActivities };
