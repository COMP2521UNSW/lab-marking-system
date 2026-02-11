import { api } from '@/api/api';
import type {
	// GetActiveActivitiesForUserResponseData,
	GetAllActivitiesResponseData,
} from '@/types/services/activities';

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
