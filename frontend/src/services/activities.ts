import type {
	// GetActiveActivitiesForUserResponseData,
	GetAllActivitiesResponseData,
} from '@workspace/types/services/activities';

import { api } from '@/api/api';

////////////////////////////////////////////////////////////////////////////////

export async function getAllActivities() {
	const res = await api.get<GetAllActivitiesResponseData>('/activities/all');
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

// export async function getActiveActivitiesForUser() {
// 	const res = await api.get<GetActiveActivitiesForUserResponseData>( //
// 		'/activities/active',
// 	);
// 	return res.data;
// }

////////////////////////////////////////////////////////////////////////////////
