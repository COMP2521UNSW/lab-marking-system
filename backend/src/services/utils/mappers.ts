import type {
	ActivityAsStudent,
	ActivityAsTutor,
} from '@workspace/types/activities';
import type { Class } from '@workspace/types/classes';
import type { LogEvent } from '@workspace/types/logs';
import type { MarkEntry } from '@workspace/types/marks';
import type {
	ManualRequest,
	MarkingRequestAsTutor,
	OpenRequest,
	PendingRequest,
} from '@workspace/types/requests';
import type { StudentDetails, User, UserDetails } from '@workspace/types/users';

import type * as dbLogs from '@/db/logs';
import type * as dbMarks from '@/db/marks';
import type * as dbRequests from '@/db/requests';

////////////////////////////////////////////////////////////////////////////////

export function toUser(user: User): User {
	return {
		zid: user.zid,
		name: user.name,
	};
}

export function toUserDetails(user: UserDetails): UserDetails {
	return {
		zid: user.zid,
		name: user.name,
		role: user.role,
		classCode: user.classCode,
	};
}

export function toStudentDetailsList(
	students: StudentDetails[],
): StudentDetails[] {
	return students.map(toStudentDetails);
}

export function toStudentDetails(student: StudentDetails): StudentDetails {
	return {
		zid: student.zid,
		name: student.name,
		classCode: student.classCode,
	};
}

////////////////////////////////////////////////////////////////////////////////

export function toClassList(classes: Class[]): Class[] {
	return classes.map(toClass);
}

export function toClass(cls: Class): Class {
	return {
		code: cls.code,
		labLocation: cls.labLocation,
	};
}

////////////////////////////////////////////////////////////////////////////////

export function toActivityAsStudentList(
	activities: ActivityAsStudent[],
): ActivityAsStudent[] {
	return activities.map(toActivityAsStudent);
}

export function toActivityAsStudent(
	activity: ActivityAsStudent,
): ActivityAsStudent {
	return {
		code: activity.code,
		name: activity.name,
	};
}

export function toActivityAsTutorList(
	activities: ActivityAsTutor[],
): ActivityAsTutor[] {
	return activities.map(toActivityAsTutor);
}

export function toActivityAsTutor(activity: ActivityAsTutor): ActivityAsTutor {
	return {
		code: activity.code,
		name: activity.name,
		maxMark: activity.maxMark,
	};
}

////////////////////////////////////////////////////////////////////////////////

export function toOpenRequestList(requests: PendingRequest[]): OpenRequest[] {
	return requests.map(toOpenRequest);
}

export function toOpenRequest(request: PendingRequest): OpenRequest {
	return {
		id: request.id,
		createdAt: request.createdAt,
		activity: toActivityAsStudent(request.activity),
		status: request.status,
		closedAt: request.closedAt,
	};
}

export function toPendingRequestList(
	requests: Awaited<ReturnType<typeof dbRequests.getOpenRequestsByUser>>,
): PendingRequest[] {
	return requests.map(toPendingRequest);
}

export function toPendingRequest(
	request: Awaited<ReturnType<typeof dbRequests.getOpenRequestsByUser>>[number],
): PendingRequest {
	return {
		id: request.id,
		createdAt: request.createdAt,
		activity: toActivityAsTutor(request.activity),
		status: 'pending',
		closedAt: null,
		claimer: request.marker,
	};
}

export function toMarkingRequestAsTutorList(
	requests: Awaited<
		ReturnType<typeof dbRequests.getActiveOrRecentRequestsByClass>
	>,
): MarkingRequestAsTutor[] {
	return requests.map(toMarkingRequestAsTutor);
}

export function toMarkingRequestAsTutor(
	request: Awaited<
		ReturnType<typeof dbRequests.getActiveOrRecentRequestsByClass>
	>[number],
): MarkingRequestAsTutor {
	const base = {
		id: request.id,
		createdAt: request.createdAt,
		activity: toActivityAsTutor(request.activity),
	};

	switch (request.status) {
		case 'pending':
			return {
				...base,
				status: 'pending',
				closedAt: null,
				claimer: request.marker,
			};
		case 'withdrawn':
			return {
				...base,
				status: 'withdrawn',
				closedAt: request.closedAt!,
				reason: request.reason!,
			};
		case 'declined':
			return {
				...base,
				status: 'declined',
				closedAt: request.closedAt!,
				tutorName: request.marker!.name,
				reason: request.reason!,
			};
		case 'marked':
			return {
				...base,
				status: 'marked',
				closedAt: request.closedAt!,
				markerName: request.marker!.name,
				mark: request.mark!,
			};
	}
}

export function toManualRequestList(
	requests: Awaited<ReturnType<typeof dbRequests.getManualRequests>>,
): ManualRequest[] {
	return requests.map(toManualRequest);
}

export function toManualRequest(
	request: Awaited<ReturnType<typeof dbRequests.getManualRequests>>[number],
): ManualRequest {
	const base = {
		id: request.id,
		student: request.student,
		activity: toActivityAsTutor(request.activity),
		reason: request.reason,
		mark: request.mark,
		markerName: request.markerName,
		markedAt: request.markedAt,
	};

	switch (request.status) {
		case 'pending':
			return {
				...base,
				status: 'pending',
			};
		case 'approved':
			return {
				...base,
				status: 'approved',
				approverName: request.approverName!,
				closedAt: request.closedAt!,
			};
		case 'denied':
			return {
				...base,
				status: 'denied',
				approverName: request.approverName!,
				closedAt: request.closedAt!,
				denyReason: request.denyReason!,
			};
	}
}

////////////////////////////////////////////////////////////////////////////////

export function toMarkEntryList(
	markEntries: Awaited<ReturnType<typeof dbMarks.getStudentMarks>>,
): MarkEntry[] {
	return markEntries.map(toMarkEntry);
}

export function toMarkEntry(
	markEntry: Awaited<ReturnType<typeof dbMarks.getStudentMarks>>[number],
): MarkEntry {
	return {
		activity: toActivityAsTutor(markEntry.activity),
		mark: markEntry.mark,
		markedAt: markEntry.markedAt,
	};
}

////////////////////////////////////////////////////////////////////////////////

export function toLogEventList(
	logs: Awaited<ReturnType<typeof dbLogs.getStudentLogs>>,
): LogEvent[] {
	return logs.map(toLogEvent);
}

export function toLogEvent(
	log: Awaited<ReturnType<typeof dbLogs.getStudentLogs>>[number],
): LogEvent {
	if (log.eventType === 'class-changed') {
		return {
			eventType: 'class-changed',
			classCode: log.classCode!,
			timestamp: log.timestamp,
		};
	}

	const base = {
		activity: toActivityAsTutor(log.activity!),
		timestamp: log.timestamp,
	};

	switch (log.eventType) {
		case 'request-created':
			return {
				...base,
				eventType: 'request-created',
				classCode: log.classCode!,
			};
		case 'request-withdrawn':
			return {
				...base,
				eventType: 'request-withdrawn',
				classCode: log.classCode!,
				reason: log.reason!,
			};
		case 'request-declined':
			return {
				...base,
				eventType: 'request-declined',
				classCode: log.classCode!,
				markerName: log.markerName!,
				reason: log.reason!,
			};
		case 'request-marked':
			return {
				...base,
				eventType: 'request-marked',
				classCode: log.classCode!,
				markerName: log.markerName!,
				mark: log.mark!,
			};
		case 'mark-amended':
			return {
				...base,
				eventType: 'mark-amended',
				classCode: log.classCode!,
				markerName: log.markerName!,
				mark: log.mark!,
			};
		case 'manual-request-created':
			return {
				...base,
				eventType: 'manual-request-created',
				markerName: log.markerName!,
				mark: log.mark!,
				reason: log.reason!,
			};
		case 'manual-request-approved':
			return {
				...base,
				eventType: 'manual-request-approved',
				approverName: log.approverName!,
			};
		case 'manual-request-denied':
			return {
				...base,
				eventType: 'manual-request-denied',
				approverName: log.approverName!,
				reason: log.reason!,
			};
		case 'mark-imported-from-sms':
			return {
				...base,
				eventType: 'mark-imported-from-sms',
				mark: log.mark,
			};
	}
}

////////////////////////////////////////////////////////////////////////////////
