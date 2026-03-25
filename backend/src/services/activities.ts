import type { ActivitiesService } from '@workspace/types/services/activities';
import type { SessionUser } from '@workspace/types/users';

import * as dbActivities from '@/db/activities';
import type { BackendService } from '@/types/utils';

import { toActivityAsStudent, toActivityAsTutorList } from './utils/mappers';
import { getCurrentWeek } from './utils/term';

class BackendActivitiesService implements BackendService<ActivitiesService> {
	async getAllActivities(user: SessionUser) {
		const activities = await dbActivities.getAllActivities();

		return toActivityAsTutorList(activities);
	}

	async getActiveActivitiesForUser(user: SessionUser) {
		const week = await getCurrentWeek();

		const rows = await dbActivities.getActiveActivitiesAndMarksForUser(
			week,
			user.zid,
		);

		return rows.map((row) => ({
			activity: toActivityAsStudent(row.activity),
			marked: row.mark !== null,
		}));
	}
}

const activitiesService: BackendService<ActivitiesService> =
	new BackendActivitiesService();

export default activitiesService;
