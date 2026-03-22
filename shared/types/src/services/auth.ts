import type { UserDetails } from '../users';

////////////////////////////////////////////////////////////////////////////////

export interface AuthService {
	logIn(req: LogInRequestData): Promise<LogInResponseData>;
	logOut(): Promise<void>;
	getUser(): Promise<GetUserResponseData>;
}

////////////////////////////////////////////////////////////////////////////////

export type LogInRequestData = {
	zid: string;
	password: string;
};

export type LogInResponseData = UserDetails;

export type GetUserResponseData = UserDetails | null;
