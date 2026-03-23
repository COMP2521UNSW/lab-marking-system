import * as bcrypt from 'bcrypt';

import type {
	AuthService,
	LogInRequestData,
} from '@workspace/types/services/auth';
import type { SessionUser } from '@workspace/types/users';

import * as dbUsers from '@/db/users';
import { authenticate } from '@/lib/auth';
import { InternalServerError, UnauthorizedError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { BackendService } from '@/types/utils';

import { toUserDetails } from './utils/mappers';

class BackendAuthService implements BackendService<AuthService> {
	//////////////////////////////////////////////////////////////////////////////

	async logIn(_: SessionUser, req: LogInRequestData) {
		const loggableData = { zid: req.zid };

		const { zid, password } = req;

		// Checking password first prevents enumeration attack
		if (!(await this.authenticateUser(zid, password))) {
			logger.info('Authentication error', { loggableData });

			throw new UnauthorizedError('Incorrect zID or password');
		}

		const user = await dbUsers.getUserByZid(zid);

		if (user === null || !user.enrolled) {
			logger.info('Not enrolled', { loggableData });

			throw new UnauthorizedError('Not enrolled in the course');
		} else {
			logger.info('Logging in', { user });

			return toUserDetails(user);
		}
	}

	private async authenticateUser(zid: string, password: string) {
		if (this.isMasterPassword(password)) {
			return true;
		} else {
			return await authenticate(zid, password);
		}
	}

	private isMasterPassword(password: string) {
		return (
			process.env.MASTER_PASSWORD_HASH &&
			bcrypt.compareSync(password, process.env.MASTER_PASSWORD_HASH)
		);
	}

	//////////////////////////////////////////////////////////////////////////////

	// eslint-disable-next-line @typescript-eslint/require-await
	async logOut(user: SessionUser) {
		logger.info('Logging out', { user });
	}

	//////////////////////////////////////////////////////////////////////////////

	async getUser(user: SessionUser) {
		if (user === null) {
			return null;
		}

		const dbUser = await dbUsers.getUserByZid(user.zid);

		if (dbUser === null) {
			throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
		}

		return toUserDetails(dbUser);
	}

	//////////////////////////////////////////////////////////////////////////////
}

const authService: BackendService<AuthService> = new BackendAuthService();

export default authService;
