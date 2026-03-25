import type { PagesService } from '@workspace/types/services/pages';
import type { SessionUser } from '@workspace/types/users';

import activitiesService from '@/services/activities';
import classesService from '@/services/classes';
import requestsService from '@/services/requests';
import type { BackendService } from '@/types/utils';

class BackendPagesService implements BackendService<PagesService> {
	async getStudentRequestsPage(user: SessionUser) {
		const [activeClasses, activeActivities, requestDetails] = await Promise.all(
			[
				classesService.getActiveClasses(user),
				activitiesService.getActiveActivitiesForUser(user),
				requestsService.getActiveRequestsForCurrentUser(user),
			],
		);

		return {
			activeClasses,
			activeActivities,
			requestDetails,
		};
	}
}

const pagesService: BackendService<PagesService> = new BackendPagesService();

export default pagesService;
