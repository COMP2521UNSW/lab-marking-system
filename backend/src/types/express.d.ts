import 'express';

import type { SessionUser } from '@workspace/types/users';

declare global {
	namespace Express {
		interface Request {
			maybeUser: SessionUser | null;
			user: SessionUser;
		}
	}
}
