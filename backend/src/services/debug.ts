import type {
	DebugRequestData,
	DebugService,
} from '@workspace/types/services/debug';
import type { SessionUser } from '@workspace/types/users';

import { logger } from '@/lib/logger';
import type { BackendService } from '@/types/utils';

class BackendDebugService implements BackendService<DebugService> {
	// eslint-disable-next-line @typescript-eslint/require-await
	async debug(user: SessionUser, req: DebugRequestData) {
		logger.info(req.message, { user });
	}
}

const debugService: BackendService<DebugService> = new BackendDebugService();

export default debugService;
