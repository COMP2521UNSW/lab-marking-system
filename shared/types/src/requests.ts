import type { ActivityAsStudent, ActivityAsTutor } from './activities';
import type { Student } from './users';

////////////////////////////////////////////////////////////////////////////////

export type RequestStatus = 'pending' | 'withdrawn' | 'declined' | 'marked';

interface BaseMarkingRequest {
	id: number;
	createdAt: Date;
	status: RequestStatus;
}

export type MarkingRequestAsStudent = OpenRequest | ClosedRequest;

interface BaseMarkingRequestAsStudent extends BaseMarkingRequest {
	activity: ActivityAsStudent;
}

export interface OpenRequest extends BaseMarkingRequestAsStudent {
	status: 'pending';
	closedAt: null;
}

export interface ClosedRequest extends BaseMarkingRequestAsStudent {
	status: 'withdrawn' | 'declined' | 'marked';
	closedAt: Date;
}

export type MarkingRequestAsTutor =
	| PendingRequest
	| WithdrawnRequest
	| DeclinedRequest
	| MarkedRequest;

interface BaseMarkingRequestAsTutor extends BaseMarkingRequest {
	activity: ActivityAsTutor;
}

export interface PendingRequest extends BaseMarkingRequestAsTutor {
	status: 'pending';
	closedAt: null;
}

export interface WithdrawnRequest extends BaseMarkingRequestAsTutor {
	status: 'withdrawn';
	closedAt: Date;
}

export interface DeclinedRequest extends BaseMarkingRequestAsTutor {
	status: 'declined';
	closedAt: Date;
}

export interface MarkedRequest extends BaseMarkingRequestAsTutor {
	status: 'marked';
	closedAt: Date;
	markerName: string;
	mark: number;
}

////////////////////////////////////////////////////////////////////////////////

export type StudentWithRequests = {
	student: Student;
	requests: MarkingRequestAsTutor[];
};

////////////////////////////////////////////////////////////////////////////////

export type ManualRequestStatus = 'pending' | 'approved' | 'denied';

export type ManualRequest =
	| PendingManualRequest
	| ApprovedManualRequest
	| DeniedManualRequest;

interface BaseManualRequest {
	id: number;
	student: Student;
	activity: ActivityAsTutor;
	reason: string;
	mark: number;
	markerName: string;
	markedAt: Date;
	status: ManualRequestStatus;
}

export interface PendingManualRequest extends BaseManualRequest {
	status: 'pending';
}

export interface ApprovedManualRequest extends BaseManualRequest {
	status: 'approved';
	approverName: string;
}

export interface DeniedManualRequest extends BaseManualRequest {
	status: 'denied';
	approverName: string;
	denyReason: string;
}

////////////////////////////////////////////////////////////////////////////////
