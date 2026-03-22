import '@/lib/polyfills/group-by';

import { addMinutes, format, getISODay, isSameDay } from 'date-fns';

import { MAX_REASON_LEN } from '@workspace/lib/constants';
import type { ActivityAsTutor } from '@workspace/types/activities';
import type {
	ManualRequest,
	MarkingRequestAsStudent,
	MarkingRequestAsTutor,
	OpenRequest,
	PendingRequest,
} from '@workspace/types/requests';
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
	UnclaimRequestRequestData,
	UpdateRequestsRequestData,
	WithdrawRequestRequestData,
} from '@workspace/types/services/requests';
import type { SessionUser } from '@workspace/types/users';

import * as dbActivities from '@/db/activities';
import * as dbClasses from '@/db/classes';
import * as dbLogs from '@/db/logs';
import * as dbMarks from '@/db/marks';
import * as dbRequests from '@/db/requests';
import * as dbSettings from '@/db/settings';
import * as dbUsers from '@/db/users';
import { toLocalDate, toLocalStartOfDay } from '@/lib/date';
import { BadRequestError, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import * as activitiesService from '@/services/activities';
import * as studentMessages from '@/sockets/student-messages';
import * as tutorMessages from '@/sockets/tutor-messages';

import { getCurrentTime, getCurrentWeek } from './utils';

////////////////////////////////////////////////////////////////////////////////

export async function getActiveRequestsForCurrentUser(
	user: SessionUser, //
): Promise<GetActiveRequestsForCurrentUserResponseData> {
	const currClass = await dbRequests.getCurrentClass(user.zid);
	if (currClass === null) {
		return {
			class: null,
			requests: [],
		};
	}

	const requests = await dbRequests.getOpenRequestsByUser(user.zid);
	return {
		class: currClass,
		requests: toStudentRequests(requests),
	};
}

////////////////////////////////////////////////////////////////////////////////

export async function updateRequests(
	user: SessionUser,
	req: UpdateRequestsRequestData,
) {
	logger.info('Updating requests', { user, req });

	await validateUpdateRequests(user, req);

	const currClass = await dbRequests.getCurrentClass(user.zid);

	if (currClass === null && req.activityCodes.length === 0) {
		throw new BadRequestError("Can't change classes with no requests");
	}

	const timestamp = new Date();

	// class changed
	if (currClass !== null && req.classCode !== currClass.code) {
		await dbRequests.updateRequestsClass(user.zid, req.classCode, timestamp);
		logger.info('Successfully updated class', { user });
	}

	if (req.activityCodes.length > 0) {
		const res = await dbRequests.createRequests(
			user.zid,
			req.classCode,
			req.activityCodes,
			timestamp,
		);
		if (res) {
			const ids = res.map((row) => row.id);
			logger.info('Successfully created requests', { user, ids: { ids } });
		}
	}

	//////////////
	// Log event

	if (currClass !== null && req.classCode !== currClass.code) {
		await dbLogs.logClassChanged(user.zid, req.classCode, timestamp);
	}

	if (req.activityCodes.length > 0) {
		await dbLogs.logRequestsCreated(
			user.zid,
			req.activityCodes,
			req.classCode,
			timestamp,
		);
	}

	////////////////////
	// Socket messages

	const student = await dbUsers.getStudentByZid(user.zid);
	if (student === null) {
		throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
	}

	const { class: cls, requests } = await getRequestDetails(user.zid, req);

	studentMessages.requestsUpdated(
		user.zid,
		cls,
		toStudentRequests<OpenRequest>(requests),
	);

	// class changed
	if (currClass !== null && req.classCode !== currClass.code) {
		const requests = await getOpenRequests(user.zid);
		tutorMessages.studentLeft(currClass.code, user.zid);
		tutorMessages.studentJoined(req.classCode, student, requests);
	} else {
		tutorMessages.requestsCreated(
			cls.code,
			student,
			toTutorRequests<PendingRequest>(requests),
		);
	}
}

async function validateUpdateRequests(
	user: SessionUser,
	req: UpdateRequestsRequestData,
) {
	await validateSelectedClass(user, req.classCode);

	await validateRequestedActivities(user, req.activityCodes);
}

async function validateSelectedClass(user: SessionUser, classCode: string) {
	const classDetails = await dbClasses.getClassDetails(classCode);

	if (classDetails === null) {
		throw new BadRequestError('Invalid class');
	}

	const earlyRequestMinutes = await dbSettings.getEarlyRequestMinutes();

	const now = toLocalDate(getCurrentTime());

	const day = getISODay(now);
	const time = format(now, 'HH:mm');
	const upcomingTime = format(addMinutes(now, earlyRequestMinutes), 'HH:mm');

	if (
		!(
			day === classDetails.dayOfWeek &&
			((time >= classDetails.labStartTime && time < classDetails.labEndTime) ||
				(upcomingTime >= classDetails.labStartTime &&
					upcomingTime < classDetails.labEndTime))
		)
	) {
		throw new BadRequestError('Class is not open for requests', {
			logLevel: 'info',
		});
	}
}

async function validateRequestedActivities(
	user: SessionUser,
	activityCodes: string[],
) {
	if (activityCodes.length > 5) {
		throw new BadRequestError("Can't create more than 5 requests at a time");
	}

	const activeActivities =
		await activitiesService.getActiveActivitiesForUser(user);

	activityCodes.forEach((activityCode) => {
		const activity = activeActivities.find(
			(activeActivity) => activeActivity.activity.code === activityCode,
		);

		if (!activity) {
			throw new BadRequestError(`Can't request marking for ${activityCode}`);
		}

		if (activity.marked) {
			throw new BadRequestError(`${activityCode} has already been marked`);
		}
	});

	const requests = await dbRequests.getOpenRequestsByUser(user.zid);

	requests.forEach((request) => {
		if (activityCodes.includes(request.activity.code)) {
			throw new BadRequestError(
				`Already requested marking for ${request.activity.code}`,
			);
		}
	});
}

////////////////////////////////////////////////////////////////////////////////

export async function withdrawRequest(
	user: SessionUser,
	req: WithdrawRequestRequestData,
) {
	logger.info('Withdrawing request', { user, req });

	req = validateWithdrawRequest(req);

	const timestamp = new Date();

	const res = await dbRequests.withdrawRequest(
		user.zid,
		req.id,
		req.reason,
		timestamp,
	);

	if (res === null) {
		throw new BadRequestError("Can't withdraw this request");
	}

	logger.info('Request successfully withdrawn', { user });

	// Log event
	await dbLogs.logRequestWithdrawn(
		user.zid,
		res.activityCode,
		res.classCode,
		req.reason,
		timestamp,
	);

	// Socket messages
	studentMessages.requestWithdrawn(user.zid, req.id);
	tutorMessages.requestWithdrawn(res.classCode, req.id, req.reason, timestamp);
}

function validateWithdrawRequest(req: WithdrawRequestRequestData) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		throw new BadRequestError('Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		throw new BadRequestError(
			`Reason must not exceed ${MAX_REASON_LEN} characters`,
		);
	}

	return req;
}

////////////////////////////////////////////////////////////////////////////////

export async function getRequestsByClass(
	user: SessionUser,
	req: GetRequestsByClassRequestData,
): Promise<GetRequestsByClassResponseData> {
	await validateGetRequestsByClass(req);

	const requests = await dbRequests.getActiveOrRecentRequestsByClass(
		req.classCode,
		toLocalStartOfDay(new Date()),
	);

	const groupedRequests = Map.groupBy(
		requests,
		(request) => request.student.zid,
	);

	return Array.from(groupedRequests.entries()).map(([zid, requests]) => {
		return {
			student: requests[0].student,
			requests: requests.map(({ student, marker, ...request }) => {
				// request is expected to satisfy the MarkingRequestAsTutor union type
				return (
					request.status === 'pending'
						? { ...request, claimer: marker }
						: request.status === 'declined'
							? { ...request, tutorName: marker !== null ? marker.name : null }
							: {
									...request,
									markerName: marker !== null ? marker.name : null,
								}
				) as MarkingRequestAsTutor;
			}),
		};
	});
}

async function validateGetRequestsByClass(req: GetRequestsByClassRequestData) {
	const cls = await dbClasses.getClassDetails(req.classCode);

	if (cls === null) {
		throw new BadRequestError('Invalid class');
	}
}

////////////////////////////////////////////////////////////////////////////////

export async function claimRequest(
	user: SessionUser,
	req: ClaimRequestRequestData,
) {
	logger.info('Claiming request', { user, req });

	const res = await dbRequests.claimRequest(req.id, user.zid);

	if (res === null) {
		throw new BadRequestError("Can't claim this request");
	}

	logger.info('Request successfully claimed', { user });

	const marker = await dbUsers.getUserByZid(user.zid);
	if (marker === null) {
		throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
	}

	// Socket messages
	tutorMessages.requestClaimed(res.classCode, req.id, {
		zid: marker.zid,
		name: marker.name,
	});
}

////////////////////////////////////////////////////////////////////////////////

export async function unclaimRequest(
	user: SessionUser,
	req: UnclaimRequestRequestData,
) {
	logger.info('Unclaiming request', { user, req });

	const res = await dbRequests.unclaimRequest(req.id, user.zid);

	if (res === null) {
		throw new BadRequestError("Can't unclaim this request");
	}

	logger.info('Request successfully unclaimed', { user });

	// Socket messages
	tutorMessages.requestUnclaimed(res.classCode, req.id);
}

////////////////////////////////////////////////////////////////////////////////

export async function declineRequest(
	user: SessionUser,
	req: DeclineRequestRequestData,
) {
	logger.info('Declining request', { user, req });

	req = validateDeclineRequest(req);

	const timestamp = new Date();

	const res = await dbRequests.declineRequest(
		req.id,
		user.zid,
		req.reason,
		timestamp,
	);

	if (res === null) {
		throw new BadRequestError("Can't decline this request");
	}

	logger.info('Request successfully declined', { user });

	// Log event
	await dbLogs.logRequestDeclined(
		res.studentZid,
		res.activityCode,
		res.classCode,
		user.zid,
		req.reason,
		timestamp,
	);

	// Socket messages
	const tutor = await dbUsers.getUserByZid(user.zid);
	if (tutor === null) {
		throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
	}

	studentMessages.requestDeclined(res.studentZid, req.id, req.reason);
	tutorMessages.requestDeclined(
		res.classCode,
		req.id,
		tutor.name,
		req.reason,
		timestamp,
	);
}

function validateDeclineRequest(req: DeclineRequestRequestData) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		throw new BadRequestError('Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		throw new BadRequestError(
			`Reason must not exceed ${MAX_REASON_LEN} characters`,
		);
	}

	return req;
}

////////////////////////////////////////////////////////////////////////////////

export async function markRequest(
	user: SessionUser,
	req: MarkRequestRequestData,
) {
	logger.info('Marking request', { user, req });

	await validateMarkRequest(req);

	const timestamp = new Date();

	const res = await dbRequests.markRequest(
		req.id,
		user.zid,
		req.mark,
		timestamp,
	);

	if (res === null) {
		throw new InternalServerError('Request not found');
	}

	await dbMarks.setMark(res.studentZid, res.activityCode, req.mark, timestamp);

	logger.info('Request successfully marked', { user });

	// Log event
	await dbLogs.logRequestMarked(
		res.studentZid,
		res.activityCode,
		res.classCode,
		user.zid,
		req.mark,
		timestamp,
	);

	// Socket messages
	const marker = await dbUsers.getUserByZid(user.zid);
	if (marker === null) {
		throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
	}

	studentMessages.requestMarked(res.studentZid, req.id, timestamp);
	tutorMessages.requestMarked(
		res.classCode,
		req.id,
		marker.name,
		req.mark,
		timestamp,
	);
}

async function validateMarkRequest(req: MarkRequestRequestData) {
	const request = await dbRequests.getOpenRequest(req.id);
	if (request === null) {
		throw new BadRequestError('Request not found');
	}

	const activity = await dbActivities.getActivityByCode(request.activityCode);
	if (activity === null) {
		throw new InternalServerError(
			`Couldn't find activity with code ${request.activityCode}`,
		);
	}

	const week = await getCurrentWeek();
	if (week < activity.startWeek || week > activity.endWeek) {
		throw new BadRequestError(
			`${request.activityCode} cannot be marked in week ${week}`,
		);
	}

	validateActivityMark(activity, req.mark);
}

////////////////////////////////////////////////////////////////////////////////

export async function amendMark(user: SessionUser, req: AmendMarkRequestData) {
	logger.info('Amending mark', { user, req });

	await validateAmendMark(req);

	const timestamp = new Date();

	const res = await dbRequests.amendMark(req.id, user.zid, req.mark);

	if (res === null) {
		throw new InternalServerError(`Couldn't find request with id ${req.id}`);
	}

	await dbMarks.setMark(res.studentZid, res.activityCode, req.mark, timestamp);

	logger.info('Mark successfully amended', { user });

	// Log event
	await dbLogs.logMarkAmended(
		res.studentZid,
		res.activityCode,
		res.classCode,
		user.zid,
		req.mark,
		timestamp,
	);

	// Socket messages
	const marker = await dbUsers.getUserByZid(user.zid);
	if (marker === null) {
		throw new InternalServerError(`Couldn't find user with zid ${user.zid}`);
	}

	tutorMessages.markAmended(res.classCode, req.id, marker.name, req.mark);
}

async function validateAmendMark(req: AmendMarkRequestData) {
	const request = await dbRequests.getMarkedRequest(req.id);
	if (request === null) {
		throw new BadRequestError('Request not found');
	}

	const activity = await dbActivities.getActivityByCode(request.activityCode);
	if (activity === null) {
		throw new InternalServerError(
			`Couldn't find activity with code ${request.activityCode}`,
		);
	}

	// A mark can only be amended on the same day as it was marked
	if (!isSameDay(request.markedAt, new Date())) {
		throw new BadRequestError('Too late to amend mark');
	}

	validateActivityMark(activity, req.mark);

	if (req.mark === request.mark) {
		throw new BadRequestError('New mark must be different from current mark');
	}
}

////////////////////////////////////////////////////////////////////////////////
//                              MANUAL REQUESTS                               //
////////////////////////////////////////////////////////////////////////////////

export async function createManualRequest(
	user: SessionUser,
	req: CreateManualRequestRequestData,
) {
	logger.info('Creating manual request', { user, req });

	req = await validateCreateManualRequest(req);

	const res = await dbRequests.createManualRequest(
		req.studentZid,
		req.activityCode,
		req.reason,
		req.mark,
		user.zid,
	);

	logger.info('Request successfully created', { user, res: { id: res.id } });

	await dbLogs.logManualRequestCreated(
		req.studentZid,
		req.activityCode,
		user.zid,
		req.mark,
		req.reason,
		res.createdAt,
	);
}

async function validateCreateManualRequest(
	req: CreateManualRequestRequestData,
) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		throw new BadRequestError('Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		throw new BadRequestError(
			`Reason must not exceed ${MAX_REASON_LEN} characters`,
		);
	}

	const student = await dbUsers.getStudentByZid(req.studentZid);
	if (student === null) {
		throw new BadRequestError('Invalid student');
	}

	const activity = await dbActivities.getActivityByCode(req.activityCode);
	if (activity === null) {
		throw new BadRequestError('Invalid activity');
	}

	validateActivityMark(activity, req.mark);

	return req;
}

////////////////////////////////////////////////////////////////////////////////

export async function getAllManualRequests(
	user: SessionUser, //
): Promise<GetAllManualRequestsResponseData> {
	const requests = await dbRequests.getManualRequests();

	// requests are expected to satisfy the ManualRequest union type
	return requests as ManualRequest[];
}

////////////////////////////////////////////////////////////////////////////////

export async function approveManualRequest(
	user: SessionUser,
	req: ApproveManualRequestRequestData,
): Promise<ApproveManualRequestResponseData> {
	logger.info('Approving manual request', { user, req });

	const timestamp = new Date();

	const res = await dbRequests.approveManualRequest(
		req.id,
		user.zid,
		timestamp,
	);

	if (res === null) {
		throw new BadRequestError('No open request with this id');
	}

	await dbMarks.setMark(
		res.studentZid,
		res.activityCode,
		res.mark,
		res.createdAt,
	);

	logger.info('Request successfully approved', { user });

	await dbLogs.logManualRequestApproved(
		res.studentZid,
		res.activityCode,
		user.zid,
		timestamp,
	);

	const request = (await dbRequests.getManualRequests([req.id]))[0];

	// requests is expected to satisfy the ManualRequest union type
	return request as ManualRequest;
}

////////////////////////////////////////////////////////////////////////////////

export async function denyManualRequest(
	user: SessionUser,
	req: DenyManualRequestRequestData,
): Promise<DenyManualRequestResponseData> {
	logger.info('Denying manual request', { user, req });

	req = validateDenyManualRequest(req);

	const timestamp = new Date();

	const res = await dbRequests.denyManualRequest(
		req.id,
		user.zid,
		req.reason,
		timestamp,
	);

	if (res === null) {
		throw new BadRequestError('No open request with this id');
	}

	logger.info('Request successfully denied', { user });

	await dbLogs.logManualRequestDenied(
		res.studentZid,
		res.activityCode,
		user.zid,
		req.reason,
		timestamp,
	);

	const request = (await dbRequests.getManualRequests([req.id]))[0];

	// requests is expected to satisfy the ManualRequest union type
	return request as ManualRequest;
}

function validateDenyManualRequest(req: DenyManualRequestRequestData) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		throw new BadRequestError('Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		throw new BadRequestError(
			`Reason must not exceed ${MAX_REASON_LEN} characters`,
		);
	}

	return req;
}

////////////////////////////////////////////////////////////////////////////////
//                                 HELPERS                                    //
////////////////////////////////////////////////////////////////////////////////

type RequestDetails = {
	classCode: string;
	activityCodes: string[];
};

async function getOpenRequests(zid: string, activityCodes?: string[]) {
	const requests = await dbRequests.getOpenRequestsByUser(zid, activityCodes);

	return toTutorRequests<PendingRequest>(requests);
}

async function getRequestDetails(zid: string, request: RequestDetails) {
	const cls = await dbClasses.getClassDetails(request.classCode);
	if (cls === null) {
		throw new InternalServerError(
			`Couldn't find class with code ${request.classCode}`,
		);
	}

	const requests = await dbRequests.getOpenRequestsByUser(
		zid,
		request.activityCodes,
	);

	return {
		class: {
			code: cls.code,
			labLocation: cls.labLocation,
		},
		requests,
	};
}

function toStudentRequests<
	T extends MarkingRequestAsStudent = MarkingRequestAsStudent,
>(requests: Awaited<ReturnType<typeof dbRequests.getOpenRequestsByUser>>) {
	return requests.map(
		(request) =>
			({
				id: request.id,
				activity: {
					code: request.activity.code,
					name: request.activity.name,
				},
				createdAt: request.createdAt,
				status: request.status,
				closedAt: request.closedAt,
			}) as T,
	);
}

function toTutorRequests<
	T extends MarkingRequestAsTutor = MarkingRequestAsTutor,
>(requests: Awaited<ReturnType<typeof dbRequests.getOpenRequestsByUser>>) {
	return requests.map(
		(request) =>
			({
				id: request.id,
				activity: request.activity,
				createdAt: request.createdAt,
				status: request.status,
				closedAt: request.closedAt,
				claimer: request.marker,
			}) as T,
	);
}

function validateActivityMark(activity: ActivityAsTutor, mark: number) {
	if (mark < 0 || mark > activity.maxMark) {
		throw new BadRequestError('Invalid mark');
	}

	if (/\.\d{3}/.test(String(mark))) {
		throw new BadRequestError('Invalid mark');
	}
}

////////////////////////////////////////////////////////////////////////////////
