import type { Class } from '../classes';
import type {
	ManualRequest,
	MarkingRequestAsStudent,
	StudentWithRequests,
} from '../requests';

////////////////////////////////////////////////////////////////////////////////

export interface RequestsService {
	getActiveRequestsForCurrentUser(): Promise<GetActiveRequestsForCurrentUserResponseData>;

	updateRequests(req: UpdateRequestsRequestData): Promise<void>;

	withdrawRequest(req: WithdrawRequestRequestData): Promise<void>;

	getRequestsByClass(
		req: GetRequestsByClassRequestData,
	): Promise<GetRequestsByClassResponseData>;

	claimRequest(req: ClaimRequestRequestData): Promise<void>;

	unclaimRequest(req: UnclaimRequestRequestData): Promise<void>;

	declineRequest(req: DeclineRequestRequestData): Promise<void>;

	markRequest(req: MarkRequestRequestData): Promise<void>;

	amendMark(req: AmendMarkRequestData): Promise<void>;

	createManualRequest(req: CreateManualRequestRequestData): Promise<void>;

	getAllManualRequests(): Promise<ManualRequest[]>;

	approveManualRequest(
		req: ApproveManualRequestRequestData,
	): Promise<ManualRequest>;

	denyManualRequest(req: DenyManualRequestRequestData): Promise<ManualRequest>;
}

////////////////////////////////////////////////////////////////////////////////

export type GetActiveRequestsForCurrentUserResponseData =
	| {
			class: null;
			requests: never[];
	  }
	| {
			class: Class;
			requests: MarkingRequestAsStudent[];
	  };

export type UpdateRequestsRequestData = {
	classCode: string;
	activityCodes: string[];
};

export type WithdrawRequestRequestData = {
	id: number;
	reason: string;
};

export type GetRequestsByClassRequestData = {
	classCode: string;
};

export type GetRequestsByClassResponseData = StudentWithRequests[];

export type ClaimRequestRequestData = {
	id: number;
};

export type UnclaimRequestRequestData = {
	id: number;
};

export type DeclineRequestRequestData = {
	id: number;
	reason: string;
};

export type MarkRequestRequestData = {
	id: number;
	mark: number;
};

export type AmendMarkRequestData = {
	id: number;
	mark: number;
};

export type CreateManualRequestRequestData = {
	studentZid: string;
	activityCode: string;
	reason: string;
	mark: number;
};

export type GetAllManualRequestsResponseData = ManualRequest[];

export type ApproveManualRequestRequestData = {
	id: number;
};

export type ApproveManualRequestResponseData = ManualRequest;

export type DenyManualRequestRequestData = {
	id: number;
	reason: string;
};

export type DenyManualRequestResponseData = ManualRequest;
