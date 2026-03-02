import type {
	AmendMarkRequestData,
	ApproveManualRequestRequestData,
	ApproveManualRequestResponseData,
	CreateManualRequestRequestData,
	DeclineRequestRequestData,
	DenyManualRequestRequestData,
	DenyManualRequestResponseData,
	// GetActiveRequestsForCurrentUserResponseData,
	GetAllManualRequestsResponseData,
	GetRequestsByClassRequestData,
	GetRequestsByClassResponseData,
	MarkRequestRequestData,
	UpdateRequestsRequestData,
	WithdrawRequestRequestData,
} from '@workspace/types/services/requests';

import { api } from '@/api/api';

////////////////////////////////////////////////////////////////////////////////

// export async function getActiveRequestsForCurrentUser() {
// 	const res = await api.get<GetActiveRequestsForCurrentUserResponseData>( //
// 		'/requests/self',
// 	);
// 	return res.data;
// }

////////////////////////////////////////////////////////////////////////////////

export async function updateRequests(req: UpdateRequestsRequestData) {
	await api.post('/requests', req);
}

////////////////////////////////////////////////////////////////////////////////

export async function withdrawRequest(req: WithdrawRequestRequestData) {
	await api.post(`/requests/${req.id}/withdraw`, { reason: req.reason });
}

////////////////////////////////////////////////////////////////////////////////

export async function getRequestsByClass(req: GetRequestsByClassRequestData) {
	const res = await api.get<GetRequestsByClassResponseData>(`/requests`, {
		params: {
			classCode: req.classCode,
		},
	});
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function declineRequest(req: DeclineRequestRequestData) {
	await api.post(`/requests/${req.id}/decline`, { reason: req.reason });
}

////////////////////////////////////////////////////////////////////////////////

export async function markRequest(req: MarkRequestRequestData) {
	await api.post(`/requests/${req.id}/mark`, { mark: req.mark });
}

////////////////////////////////////////////////////////////////////////////////

export async function amendMark(req: AmendMarkRequestData) {
	await api.post(`/requests/${req.id}/amend`, { mark: req.mark });
}

////////////////////////////////////////////////////////////////////////////////

export async function createManualRequest(req: CreateManualRequestRequestData) {
	await api.post('/requests/manual', req);
}

////////////////////////////////////////////////////////////////////////////////

export async function getAllManualRequests() {
	const res = await api.get<GetAllManualRequestsResponseData>( //
		'/requests/manual',
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function approveManualRequest(
	req: ApproveManualRequestRequestData,
) {
	const res = await api.post<ApproveManualRequestResponseData>(
		`/requests/manual/${req.id}/approve`,
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function denyManualRequest(req: DenyManualRequestRequestData) {
	const res = await api.post<DenyManualRequestResponseData>(
		`/requests/manual/${req.id}/deny`,
		{ reason: req.reason },
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////
