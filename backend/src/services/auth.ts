import * as bcrypt from 'bcrypt';

import type {
	GetUserResponseData,
	LogInRequestData,
	LogInResponseData,
} from '@workspace/types/services/auth';
import type { SessionUser } from '@workspace/types/users';

import * as dbUsers from '@/db/users';
import { authenticate } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

import { info } from './utils';

////////////////////////////////////////////////////////////////////////////////

export async function logIn(
	req: LogInRequestData, //
): Promise<LogInResponseData> {
	const loggableData = { zid: req.zid };

	info(undefined, 'Logging in', loggableData);

	const { zid, password } = req;

	// Checking password first prevents enumeration attack
	if (!(await authenticateUser(zid, password))) {
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

async function authenticateUser(zid: string, password: string) {
	if (isMasterPassword(password)) {
		return true;
	} else {
		return await authenticate(zid, password);
	}
}

function isMasterPassword(password: string) {
	return (
		process.env.MASTER_PASSWORD_HASH &&
		bcrypt.compareSync(password, process.env.MASTER_PASSWORD_HASH)
	);
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
