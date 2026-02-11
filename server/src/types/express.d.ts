import 'express';

import type { SessionUser } from '@/types/users';

declare global {
	namespace Express {
		interface Request {
			maybeUser: SessionUser | null;
			user: SessionUser;
		}
	}
}
