import type {
	GetStudentRequestsPageResponseData,
	PagesService,
} from '@workspace/types/services/pages';

import { api } from '@/api/api';

class FrontendPagesService implements PagesService {
	async getStudentRequestsPage() {
		const res = await api.get<GetStudentRequestsPageResponseData>( //
			'/pages/requests',
		);
		return res.data;
	}
}

const pagesService: PagesService = new FrontendPagesService();

export default pagesService;
