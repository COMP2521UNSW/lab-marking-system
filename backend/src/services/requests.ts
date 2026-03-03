import '@/lib/polyfills/group-by';

import { addMinutes, format, getDay, isSameDay } from 'date-fns';

import type { ActivityAsTutor } from '@workspace/types/activities';
import type {
	ManualRequest,
	MarkingRequestAsTutor,
} from '@workspace/types/requests';
import type {
	AmendMarkRequestData,
	ApproveManualRequestRequestData,
	ApproveManualRequestResponseData,
	CreateManualRequestRequestData,
	DeclineRequestRequestData,
	DenyManualRequestRequestData,
	DenyManualRequestResponseData,
	GetActiveRequestsForCurrentUserResponseData,
	GetAllManualRequestsResponseData,
	GetRequestsByClassRequestData,
	GetRequestsByClassResponseData,
	MarkRequestRequestData,
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
import { MAX_REASON_LEN } from '@/lib/constants';
import { toLocalDate, toLocalStartOfDay } from '@/lib/date';
import { BadRequestError } from '@/lib/errors';
import * as activitiesService from '@/services/activities';
import * as studentMessages from '@/sockets/student-messages';
import * as tutorMessages from '@/sockets/tutor-messages';

import {
	badRequestError,
	getCurrentTime,
	getCurrentWeek,
	info,
	internalServerError,
} from './utils';

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
		requests: mapRequests(requests),
	};
}

////////////////////////////////////////////////////////////////////////////////

export async function updateRequests(
	user: SessionUser,
	req: UpdateRequestsRequestData,
) {
	info(user, 'Updating requests', req);

	await validateUpdateRequests(user, req);

	const currClass = await dbRequests.getCurrentClass(user.zid);

	if (currClass === null && req.activityCodes.length === 0) {
		badRequestError(user, "Can't change classes with no requests");
	}

	const timestamp = new Date();

	// class changed
	if (currClass !== null && req.classCode !== currClass.code) {
		await dbRequests.updateRequestsClass(user.zid, req.classCode, timestamp);
		info(user, 'Successfully updated class');
	}

	if (req.activityCodes.length > 0) {
		const res = await dbRequests.createRequests(
			user.zid,
			req.classCode,
			req.activityCodes,
			timestamp,
		);
		if (res) {
			info(user, 'Successfully created requests', {
				ids: res.map((row) => row.id),
			});
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
		internalServerError(user, `Couldn't find user with zid ${user.zid}`);
	}

	const { class: cls, requests } = await getRequestDetails(user, user.zid, req);

	studentMessages.requestsUpdated(
		user.zid,
		cls,
		requests.map((req) => ({
			...req,
			activity: { code: req.activity.code, name: req.activity.name },
		})),
	);

	// class changed
	if (currClass !== null && req.classCode !== currClass.code) {
		const requests = await getOpenRequests(user.zid);
		tutorMessages.studentLeft(currClass.code, user.zid);
		tutorMessages.studentJoined(req.classCode, student, requests);
	} else {
		tutorMessages.requestsCreated(cls.code, student, requests);
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
		badRequestError(user, 'Invalid class');
	}

	const earlyRequestMinutes = await dbSettings.getEarlyRequestMinutes();

	const now = toLocalDate(getCurrentTime());

	const day = getDay(now);
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
		info(user, 'Class is not open for requests');
		throw new BadRequestError('Class is not open for requests');
	}
}

async function validateRequestedActivities(
	user: SessionUser,
	activityCodes: string[],
) {
	if (activityCodes.length > 5) {
		badRequestError(user, "Can't create more than 5 requests at a time");
	}

	const activeActivities =
		await activitiesService.getActiveActivitiesForUser(user);

	activityCodes.forEach((activityCode) => {
		const activity = activeActivities.find(
			(activeActivity) => activeActivity.activity.code === activityCode,
		);

		if (!activity) {
			badRequestError(user, `Can't request marking for ${activityCode}`);
		}

		if (activity.marked) {
			badRequestError(user, `${activityCode} has already been marked`);
		}
	});

	const requests = await dbRequests.getOpenRequestsByUser(user.zid);

	requests.forEach((request) => {
		if (activityCodes.includes(request.activity.code)) {
			badRequestError(
				user,
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
	info(user, 'Withdrawing request', req);

	req = validateWithdrawRequest(user, req);

	const timestamp = new Date();

	const res = await dbRequests.withdrawRequest(
		user.zid,
		req.id,
		req.reason,
		timestamp,
	);

	if (res === null) {
		badRequestError(user, "Can't withdraw this request", 'Request not found');
	}

	info(user, 'Request successfully withdrawn');

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
	tutorMessages.requestWithdrawn(res.classCode, req.id, timestamp);
}

function validateWithdrawRequest(
	user: SessionUser,
	req: WithdrawRequestRequestData,
) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		badRequestError(user, 'Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		badRequestError(
			user,
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
	await validateGetRequestsByClass(user, req);

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
			requests: requests.map(({ student, ...request }) => {
				// request is expected to satisfy the MarkingRequestAsTutor union type
				return request as MarkingRequestAsTutor;
			}),
		};
	});
}

async function validateGetRequestsByClass(
	user: SessionUser,
	req: GetRequestsByClassRequestData,
) {
	const cls = await dbClasses.getClassDetails(req.classCode);

	if (cls === null) {
		throw new BadRequestError('Invalid class');
	}
}

////////////////////////////////////////////////////////////////////////////////

export async function declineRequest(
	user: SessionUser,
	req: DeclineRequestRequestData,
) {
	info(user, 'Declining request', req);

	req = validateDeclineRequest(user, req);

	const timestamp = new Date();

	const res = await dbRequests.declineRequest(
		req.id,
		user.zid,
		req.reason,
		timestamp,
	);

	if (res === null) {
		badRequestError(user, "Can't decline this request", 'Request not found');
	}

	info(user, 'Request successfully declined');

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
	studentMessages.requestDeclined(res.studentZid, req.id, req.reason);
	tutorMessages.requestDeclined(res.classCode, req.id, timestamp);
}

function validateDeclineRequest(
	user: SessionUser,
	req: DeclineRequestRequestData,
) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		badRequestError(user, 'Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		badRequestError(
			user,
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
	info(user, 'Marking request', req);

	await validateMarkRequest(user, req);

	const timestamp = new Date();

	const res = await dbRequests.markRequest(
		req.id,
		user.zid,
		req.mark,
		timestamp,
	);

	if (res === null) {
		internalServerError(user, 'Request not found');
	}

	await dbMarks.setMark(res.studentZid, res.activityCode, req.mark, timestamp);

	info(user, 'Request successfully marked');

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
		internalServerError(user, `Couldn't find user with zid ${user.zid}`);
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

async function validateMarkRequest(
	user: SessionUser,
	req: MarkRequestRequestData,
) {
	const request = await dbRequests.getOpenRequest(req.id);
	if (request === null) {
		badRequestError(user, 'Request not found');
	}

	const activity = await dbActivities.getActivityByCode(request.activityCode);
	if (activity === null) {
		internalServerError(
			user,
			`Couldn't find activity with code ${request.activityCode}`,
		);
	}

	const week = await getCurrentWeek();
	if (week < activity.startWeek || week > activity.endWeek) {
		badRequestError(
			user,
			`${request.activityCode} cannot be marked in week ${week}`,
		);
	}

	validateActivityMark(user, activity, req.mark);
}

////////////////////////////////////////////////////////////////////////////////

export async function amendMark(user: SessionUser, req: AmendMarkRequestData) {
	info(user, 'Amending mark', req);

	await validateAmendMark(user, req);

	const timestamp = new Date();

	const res = await dbRequests.amendMark(req.id, user.zid, req.mark);

	if (res === null) {
		internalServerError(user, `Couldn't find request with id ${req.id}`);
	}

	await dbMarks.setMark(res.studentZid, res.activityCode, req.mark, timestamp);

	info(user, 'Mark successfully amended');

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
		internalServerError(user, `Couldn't find user with zid ${user.zid}`);
	}

	tutorMessages.markAmended(res.classCode, req.id, marker.name, req.mark);
}

async function validateAmendMark(user: SessionUser, req: AmendMarkRequestData) {
	const request = await dbRequests.getMarkedRequest(req.id);
	if (request === null) {
		badRequestError(user, 'Request not found');
	}

	const activity = await dbActivities.getActivityByCode(request.activityCode);
	if (activity === null) {
		internalServerError(
			user,
			`Couldn't find activity with code ${request.activityCode}`,
		);
	}

	// A mark can only be amended on the same day as it was marked
	if (!isSameDay(request.markedAt, new Date())) {
		badRequestError(user, 'Too late to amend mark');
	}

	validateActivityMark(user, activity, req.mark);

	if (req.mark === request.mark) {
		badRequestError(user, 'New mark must be different from current mark');
	}
}

////////////////////////////////////////////////////////////////////////////////
//                              MANUAL REQUESTS                               //
////////////////////////////////////////////////////////////////////////////////

export async function createManualRequest(
	user: SessionUser,
	req: CreateManualRequestRequestData,
) {
	info(user, 'Creating manual request', req);

	req = await validateCreateManualRequest(user, req);

	const res = await dbRequests.createManualRequest(
		req.studentZid,
		req.activityCode,
		req.reason,
		req.mark,
		user.zid,
	);

	info(user, 'Request successfully created', { id: res.id });

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
	user: SessionUser,
	req: CreateManualRequestRequestData,
) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		badRequestError(user, 'Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		badRequestError(
			user,
			`Reason must not exceed ${MAX_REASON_LEN} characters`,
		);
	}

	const student = await dbUsers.getStudentByZid(req.studentZid);
	if (student === null) {
		badRequestError(user, 'Invalid student');
	}

	const activity = await dbActivities.getActivityByCode(req.activityCode);
	if (activity === null) {
		badRequestError(user, 'Invalid activity');
	}

	validateActivityMark(user, activity, req.mark);

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
	info(user, 'Approving manual request', req);

	const timestamp = new Date();

	const res = await dbRequests.approveManualRequest(
		req.id,
		user.zid,
		timestamp,
	);

	if (res === null) {
		badRequestError(user, 'No open request with this id', 'Request not found');
	}

	await dbMarks.setMark(
		res.studentZid,
		res.activityCode,
		res.mark,
		res.createdAt,
	);

	info(user, 'Request successfully approved');

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
	info(user, 'Denying manual request', req);

	req = validateDenyManualRequest(user, req);

	const timestamp = new Date();

	const res = await dbRequests.denyManualRequest(
		req.id,
		user.zid,
		req.reason,
		timestamp,
	);

	if (res === null) {
		badRequestError(user, 'No open request with this id', 'Request not found');
	}

	info(user, 'Request successfully denied');

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

function validateDenyManualRequest(
	user: SessionUser,
	req: DenyManualRequestRequestData,
) {
	req.reason = req.reason.trim();

	if (req.reason.length === 0) {
		badRequestError(user, 'Reason is blank');
	}

	if (req.reason.length > MAX_REASON_LEN) {
		badRequestError(
			user,
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

	return mapRequests(requests);
}

async function getRequestDetails(
	user: SessionUser,
	zid: string,
	request: RequestDetails,
) {
	const cls = await dbClasses.getClassDetails(request.classCode);
	if (cls === null) {
		internalServerError(
			user,
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
		requests: mapRequests(requests),
	};
}

function mapRequests(
	requests: Awaited<ReturnType<typeof dbRequests.getOpenRequestsByUser>>,
) {
	// requests are expected to satisfy the MarkingRequestAsTutor union type
	return requests as MarkingRequestAsTutor[];
}

function validateActivityMark(
	user: SessionUser,
	activity: ActivityAsTutor,
	mark: number,
) {
	if (mark < 0 || mark > activity.maxMark) {
		badRequestError(user, 'Invalid mark');
	}

	if (/\.\d{3}/.test(String(mark))) {
		badRequestError(user, 'Invalid mark');
	}
}

////////////////////////////////////////////////////////////////////////////////
