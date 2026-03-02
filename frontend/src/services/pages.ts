import type { GetStudentRequestsPageResponseData } from '@workspace/types/services/pages';

import { api } from '@/api/api';

////////////////////////////////////////////////////////////////////////////////

export async function getStudentRequestsPage() {
	const res = await api.get<GetStudentRequestsPageResponseData>(
		'/pages/requests', //
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////
