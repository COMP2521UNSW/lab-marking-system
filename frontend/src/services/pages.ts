import { api } from '@/api/api';
import type { GetStudentRequestsPageResponseData } from '@/types/services/pages';

////////////////////////////////////////////////////////////////////////////////

export async function getStudentRequestsPage() {
	const res = await api.get<GetStudentRequestsPageResponseData>(
		'/pages/requests', //
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////
