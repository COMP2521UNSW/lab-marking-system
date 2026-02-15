import type { SessionUser } from '../users';

export type LogInRequestData = {
	zid: string;
	password: string;
};

export type LogInResponseData = SessionUser;

export type GetUserResponseData = SessionUser | null;
