import * as dbActivities from '@/db/activities';
import type {
	GetActiveActivitiesForUserResponseData,
	GetAllActivitiesResponseData,
} from '@/types/services/activities';
import type { SessionUser } from '@/types/users';

import { getCurrentWeek } from './utils';

////////////////////////////////////////////////////////////////////////////////

export async function getAllActivities(
	user: SessionUser, //
): Promise<GetAllActivitiesResponseData> {
	return await dbActivities.getAllActivities();
}

////////////////////////////////////////////////////////////////////////////////

export async function getActiveActivitiesForUser(
	user: SessionUser, //
): Promise<GetActiveActivitiesForUserResponseData> {
	const week = await getCurrentWeek();

	const rows = await dbActivities.getActiveActivitiesAndMarksForUser(
		week,
		user.zid,
	);

	return rows.map((row) => ({
		activity: row.activity,
		marked: row.mark !== null,
	}));
}

////////////////////////////////////////////////////////////////////////////////
