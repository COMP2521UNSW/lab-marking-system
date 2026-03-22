import type { ActivitiesService } from '@workspace/types/services/activities';
import type { SessionUser } from '@workspace/types/users';

import * as dbActivities from '@/db/activities';
import type { BackendService } from '@/types/utils';

import { getCurrentWeek } from './utils';

class BackendActivitiesService implements BackendService<ActivitiesService> {
	async getAllActivities(user: SessionUser) {
		return await dbActivities.getAllActivities();
	}

	async getActiveActivitiesForUser(user: SessionUser) {
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
}

const activitiesService: BackendService<ActivitiesService> =
	new BackendActivitiesService();

export default activitiesService;
