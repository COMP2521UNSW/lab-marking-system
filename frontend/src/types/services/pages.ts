import type { GetActiveActivitiesForUserResponseData } from './activities';
import type { GetActiveClassesResponseData } from './classes';
import type { GetActiveRequestsForCurrentUserResponseData } from './requests';

export type GetStudentRequestsPageResponseData = {
	activeClasses: GetActiveClassesResponseData;
	activeActivities: GetActiveActivitiesForUserResponseData;
	requestDetails: GetActiveRequestsForCurrentUserResponseData;
};
