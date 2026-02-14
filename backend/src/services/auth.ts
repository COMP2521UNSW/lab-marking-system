import * as dbUsers from '@/db/users';
import { UnauthorizedError } from '@/lib/errors';
import { authenticate as authenticateLdap } from '@/lib/ldap';
import { devMode } from '@/lib/utils';
import type {
	GetUserResponseData,
	LogInRequestData,
	LogInResponseData,
} from '@/types/services/auth';
import type { SessionUser } from '@/types/users';

import { info } from './utils';

////////////////////////////////////////////////////////////////////////////////

export async function logIn(
	req: LogInRequestData, //
): Promise<LogInResponseData> {
	const loggableData = { zid: req.zid };

	info(undefined, 'Logging in', loggableData);

	const { zid, password } = req;

	// Checking password first prevents enumeration attack
	if (!(await authenticate(zid, password))) {
		info(undefined, 'Authentication error', loggableData);

		throw new UnauthorizedError('Incorrect zID or password');
	}

	const user = await dbUsers.getUserByZid(zid);

	if (user === null || !user.enrolled) {
		info(undefined, 'Not enrolled', loggableData);

		throw new UnauthorizedError('Not enrolled in the course');
	} else {
		return {
			zid: user.zid,
			role: user.role,
		};
	}
}

async function authenticate(zid: string, password: string) {
	if (devMode()) {
		return true;
	} else {
		return await authenticateLdap(zid, password);
	}
}

////////////////////////////////////////////////////////////////////////////////

export function logOut(
	user: SessionUser, //
) {
	info(user, 'Logging out');
}

////////////////////////////////////////////////////////////////////////////////

export function getUser(
	user: SessionUser | null, //
): GetUserResponseData {
	return user;
}

////////////////////////////////////////////////////////////////////////////////
