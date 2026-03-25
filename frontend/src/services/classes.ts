import type {
	ClassesService,
	GetActiveClassesResponseData,
	GetAllClassesResponseData,
} from '@workspace/types/services/classes';

import { api } from '@/api/api';

class FrontendClassesService implements ClassesService {
	async getAllClasses() {
		const res = await api.get<GetAllClassesResponseData>('/classes/all');
		return res.data;
	}

	async getActiveClasses() {
		const res = await api.get<GetActiveClassesResponseData>('/classes/active');
		return res.data;
	}
}

const classesService: ClassesService = new FrontendClassesService();

export default classesService;
