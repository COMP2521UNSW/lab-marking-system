import type {
	AmendMarkRequestData,
	ApproveManualRequestRequestData,
	ApproveManualRequestResponseData,
	ClaimRequestRequestData,
	CreateManualRequestRequestData,
	DeclineRequestRequestData,
	DenyManualRequestRequestData,
	DenyManualRequestResponseData,
	GetActiveRequestsForCurrentUserResponseData,
	GetAllManualRequestsResponseData,
	GetRequestsByClassRequestData,
	GetRequestsByClassResponseData,
	MarkRequestRequestData,
	RequestsService,
	UnclaimRequestRequestData,
	UpdateRequestsRequestData,
	WithdrawRequestRequestData,
} from '@workspace/types/services/requests';

import { api } from '@/api/api';

class FrontendRequestsService implements RequestsService {
	async getActiveRequestsForCurrentUser() {
		const res = await api.get<GetActiveRequestsForCurrentUserResponseData>( //
			'/requests/self',
		);
		return res.data;
	}

	async updateRequests(req: UpdateRequestsRequestData) {
		await api.post('/requests', req);
	}

	async withdrawRequest(req: WithdrawRequestRequestData) {
		await api.post(`/requests/${req.id}/withdraw`, { reason: req.reason });
	}

	async getRequestsByClass(req: GetRequestsByClassRequestData) {
		const res = await api.get<GetRequestsByClassResponseData>(`/requests`, {
			params: {
				classCode: req.classCode,
			},
		});
		return res.data;
	}

	async claimRequest(req: ClaimRequestRequestData) {
		await api.post(`/requests/${req.id}/claim`);
	}

	async unclaimRequest(req: UnclaimRequestRequestData) {
		await api.post(`/requests/${req.id}/unclaim`);
	}

	async declineRequest(req: DeclineRequestRequestData) {
		await api.post(`/requests/${req.id}/decline`, { reason: req.reason });
	}

	async markRequest(req: MarkRequestRequestData) {
		await api.post(`/requests/${req.id}/mark`, { mark: req.mark });
	}

	async amendMark(req: AmendMarkRequestData) {
		await api.post(`/requests/${req.id}/amend`, { mark: req.mark });
	}

	async createManualRequest(req: CreateManualRequestRequestData) {
		await api.post('/requests/manual', req);
	}

	async getAllManualRequests() {
		const res = await api.get<GetAllManualRequestsResponseData>( //
			'/requests/manual',
		);
		return res.data;
	}

	async approveManualRequest(req: ApproveManualRequestRequestData) {
		const res = await api.post<ApproveManualRequestResponseData>(
			`/requests/manual/${req.id}/approve`,
		);
		return res.data;
	}

	async denyManualRequest(req: DenyManualRequestRequestData) {
		const res = await api.post<DenyManualRequestResponseData>(
			`/requests/manual/${req.id}/deny`,
			{ reason: req.reason },
		);
		return res.data;
	}
}

const requestsService: RequestsService = new FrontendRequestsService();

export default requestsService;
