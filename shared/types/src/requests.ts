import type { Temporal } from 'temporal-polyfill';

import type { ActivityAsStudent, ActivityAsTutor } from './activities';
import type { Student, User } from './users';

////////////////////////////////////////////////////////////////////////////////

export type RequestStatus = 'pending' | 'withdrawn' | 'declined' | 'marked';

interface BaseMarkingRequest {
	id: number;
	createdAt: Temporal.Instant;
	status: RequestStatus;
}

export type MarkingRequestAsStudent = OpenRequest | ClosedRequest;

interface BaseMarkingRequestAsStudent extends BaseMarkingRequest {
	activity: ActivityAsStudent;
}

export interface OpenRequest extends BaseMarkingRequestAsStudent {
	status: 'pending';
}

export interface ClosedRequest extends BaseMarkingRequestAsStudent {
	status: 'withdrawn' | 'declined' | 'marked';
	closedAt: Temporal.Instant;
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
	claimer: User | null;
}

export interface WithdrawnRequest extends BaseMarkingRequestAsTutor {
	status: 'withdrawn';
	closedAt: Temporal.Instant;
	reason: string;
}

export interface DeclinedRequest extends BaseMarkingRequestAsTutor {
	status: 'declined';
	closedAt: Temporal.Instant;
	tutorName: string;
	reason: string;
}

export interface MarkedRequest extends BaseMarkingRequestAsTutor {
	status: 'marked';
	closedAt: Temporal.Instant;
	markerName: string;
	mark: number;
}

////////////////////////////////////////////////////////////////////////////////

export type StudentWithRequests<
	T extends MarkingRequestAsTutor = MarkingRequestAsTutor,
> = {
	student: Student;
	requests: T[];
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
	markedAt: Temporal.Instant;
	status: ManualRequestStatus;
}

export interface PendingManualRequest extends BaseManualRequest {
	status: 'pending';
}

export interface ApprovedManualRequest extends BaseManualRequest {
	status: 'approved';
	approverName: string;
	closedAt: Temporal.Instant;
}

export interface DeniedManualRequest extends BaseManualRequest {
	status: 'denied';
	approverName: string;
	closedAt: Temporal.Instant;
	denyReason: string;
}

////////////////////////////////////////////////////////////////////////////////
