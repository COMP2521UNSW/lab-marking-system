import type { UserDetails } from '../users';

export type LogInRequestData = {
	zid: string;
	password: string;
};

export type LogInResponseData = UserDetails;

export type GetUserResponseData = UserDetails | null;
