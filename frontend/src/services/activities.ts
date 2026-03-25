import type {
	ActivitiesService,
	GetActiveActivitiesForUserResponseData,
	GetAllActivitiesResponseData,
} from '@workspace/types/services/activities';

import { api } from '@/api/api';

class FrontendActivitiesService implements ActivitiesService {
	async getAllActivities() {
		const res = await api.get<GetAllActivitiesResponseData>('/activities/all');
		return res.data;
	}

	async getActiveActivitiesForUser() {
		const res = await api.get<GetActiveActivitiesForUserResponseData>( //
			'/activities/active',
		);
		return res.data;
	}
}

const activitiesService: ActivitiesService = new FrontendActivitiesService();

export default activitiesService;
