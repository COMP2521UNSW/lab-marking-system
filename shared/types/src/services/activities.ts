import type { ActivityAsTutor, ActivityWithStatus } from '../activities';

////////////////////////////////////////////////////////////////////////////////

export interface ActivitiesService {
	getAllActivities(): Promise<GetAllActivitiesResponseData>;
	getActiveActivitiesForUser(): Promise<GetActiveActivitiesForUserResponseData>;
}

////////////////////////////////////////////////////////////////////////////////

export type GetAllActivitiesResponseData = ActivityAsTutor[];

export type GetActiveActivitiesForUserResponseData = ActivityWithStatus[];
