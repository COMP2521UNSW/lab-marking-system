import type {
	DebugService,
	DebugRequestData,
} from '@workspace/types/services/debug';

import { api } from '@/api/api';

class FrontendDebugService implements DebugService {
	async debug(req: DebugRequestData) {
		await api.post('/debug', { message: req.message });
	}
}

const debugService: DebugService = new FrontendDebugService();

export default debugService;
