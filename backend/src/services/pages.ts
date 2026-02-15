import type { GetStudentRequestsPageResponseData } from '@workspace/types/services/pages';
import type { SessionUser } from '@workspace/types/users';

import * as activitiesService from '@/services/activities';
import * as classesService from '@/services/classes';
import * as requestsService from '@/services/requests';

export async function getStudentRequestsPage(
	user: SessionUser,
): Promise<GetStudentRequestsPageResponseData> {
	const [activeClasses, activeActivities, requestDetails] = await Promise.all([
		classesService.getActiveClasses(user),
		activitiesService.getActiveActivitiesForUser(user),
		requestsService.getActiveRequestsForCurrentUser(user),
	]);

	return {
		activeClasses,
		activeActivities,
		requestDetails,
	};
}
