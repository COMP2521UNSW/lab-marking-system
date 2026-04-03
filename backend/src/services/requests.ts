import '@/lib/polyfills/group-by';

import { isSameDay } from 'date-fns';

import { MAX_REASON_LEN } from '@workspace/lib/constants';
import type { ActivityAsTutor } from '@workspace/types/activities';
import type {
	AmendMarkRequestData,
	ApproveManualRequestRequestData,
	ClaimRequestRequestData,
	CreateManualRequestRequestData,
	DeclineRequestRequestData,
	DenyManualRequestRequestData,
	GetRequestsByClassRequestData,
	MarkRequestRequestData,
	RequestsService,
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
import * as dbUsers from '@/db/users';
import { toLocalStartOfDay } from '@/lib/date';
import { BadRequestError, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import activitiesService from '@/services/activities';
import { classIsOpen } from '@/services/classes';
import * as studentMessages from '@/sockets/student-messages';
import * as tutorMessages from '@/sockets/tutor-messages';
import type { BackendService } from '@/types/utils';

import {
	toClass,
	toManualRequest,
	toManualRequestList,
	toMarkingRequestAsTutorList,
	toOpenRequestList,
	toPendingRequestList,
	toUser,
} from './utils/mappers';
import { getCurrentWeek } from './utils/term';

class BackendRequestsService implements BackendService<RequestsService> {
	//////////////////////////////////////////////////////////////////////////////

	async getActiveRequestsForCurrentUser(user: SessionUser) {
		const currClass = await dbRequests.getCurrentClass(user.zid);

		if (currClass === null) {
			return {
				class: null,
				requests: [],
			};
		}

		const requests = await this.getPendingRequests(user.zid);
		return {
			class: toClass(currClass),
			requests: toOpenRequestList(requests),
		};
	}

	//////////////////////////////////////////////////////////////////////////////

	async updateRequests(user: SessionUser, req: UpdateRequestsRequestData) {
		logger.info('Updating requests', { user, req });

		await this.validateUpdateRequests(user, req);

		const currClass = await dbRequests.getCurrentClass(user.zid);

		if (currClass === null && req.activityCodes.length === 0) {
			throw new BadRequestError("Can't change classes with no requests");
		}

		const timestamp = new Date();

		const classChanged = currClass !== null && req.classCode !== currClass.code;

		if (classChanged) {
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

		// Log event
		if (classChanged) {
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

		// Socket messages
		const student = await this.getStudent(user.zid);

		const cls = await this.getClass(req.classCode);
		const requests = await this.getPendingRequests(user.zid, req.activityCodes);

		studentMessages.requestsUpdated(user.zid, cls, toOpenRequestList(requests));

		if (classChanged) {
			const requests = await this.getPendingRequests(user.zid);
			tutorMessages.studentLeft(currClass.code, user.zid);
			tutorMessages.studentJoined(req.classCode, student, requests);
		} else {
			tutorMessages.requestsCreated(cls.code, student, requests);
		}
	}

	private async validateUpdateRequests(
		user: SessionUser,
		req: UpdateRequestsRequestData,
	) {
		await this.validateSelectedClass(user, req.classCode);

		await this.validateRequestedActivities(user, req.activityCodes);
	}

	private async validateSelectedClass(user: SessionUser, classCode: string) {
		const classDetails = await dbClasses.getClassDetails(classCode);

		if (classDetails === null) {
			throw new BadRequestError('Invalid class');
		}

		if (!(await classIsOpen(classDetails))) {
			throw new BadRequestError('Class is not open for requests', {
				logLevel: 'info',
			});
		}
	}

	private async validateRequestedActivities(
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

	//////////////////////////////////////////////////////////////////////////////

	async withdrawRequest(user: SessionUser, req: WithdrawRequestRequestData) {
		logger.info('Withdrawing request', { user, req });

		req = this.validateWithdrawRequest(req);

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
		tutorMessages.requestWithdrawn(
			res.classCode,
			req.id,
			req.reason,
			timestamp,
		);
	}

	private validateWithdrawRequest(req: WithdrawRequestRequestData) {
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

	//////////////////////////////////////////////////////////////////////////////

	async getRequestsByClass(
		user: SessionUser,
		req: GetRequestsByClassRequestData,
	) {
		await this.validateGetRequestsByClass(req);

		const requests = await dbRequests.getActiveOrRecentRequestsByClass(
			req.classCode,
			toLocalStartOfDay(new Date()),
		);

		const groupedRequests = Map.groupBy(
			requests,
			(request) => request.student.zid,
		);

		return Array.from(groupedRequests.entries()).map(([zid, requests]) => ({
			student: toUser(requests[0].student),
			requests: toMarkingRequestAsTutorList(requests),
		}));
	}

	private async validateGetRequestsByClass(req: GetRequestsByClassRequestData) {
		const cls = await dbClasses.getClassDetails(req.classCode);

		if (cls === null) {
			throw new BadRequestError('Invalid class');
		}
	}

	//////////////////////////////////////////////////////////////////////////////

	async claimRequest(user: SessionUser, req: ClaimRequestRequestData) {
		logger.info('Claiming request', { user, req });

		const res = await dbRequests.claimRequest(req.id, user.zid);

		if (res === null) {
			throw new BadRequestError("Can't claim this request");
		}

		logger.info('Request successfully claimed', { user });

		const marker = await this.getUser(user.zid);

		// Socket messages
		tutorMessages.requestClaimed(res.classCode, req.id, marker);
	}

	//////////////////////////////////////////////////////////////////////////////

	async unclaimRequest(user: SessionUser, req: UnclaimRequestRequestData) {
		logger.info('Unclaiming request', { user, req });

		const res = await dbRequests.unclaimRequest(req.id, user.zid);

		if (res === null) {
			throw new BadRequestError("Can't unclaim this request");
		}

		logger.info('Request successfully unclaimed', { user });

		// Socket messages
		tutorMessages.requestUnclaimed(res.classCode, req.id);
	}

	//////////////////////////////////////////////////////////////////////////////

	async declineRequest(user: SessionUser, req: DeclineRequestRequestData) {
		logger.info('Declining request', { user, req });

		req = this.validateDeclineRequest(req);

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
		const tutor = await this.getUser(user.zid);

		studentMessages.requestDeclined(res.studentZid, req.id, req.reason);
		tutorMessages.requestDeclined(
			res.classCode,
			req.id,
			tutor.name,
			req.reason,
			timestamp,
		);
	}

	private validateDeclineRequest(req: DeclineRequestRequestData) {
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

	//////////////////////////////////////////////////////////////////////////////

	async markRequest(user: SessionUser, req: MarkRequestRequestData) {
		logger.info('Marking request', { user, req });

		await this.validateMarkRequest(req);

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

		await dbMarks.setMark(
			res.studentZid,
			res.activityCode,
			req.mark,
			timestamp,
		);

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
		const marker = await this.getUser(user.zid);

		studentMessages.requestMarked(res.studentZid, req.id, timestamp);
		tutorMessages.requestMarked(
			res.classCode,
			req.id,
			marker.name,
			req.mark,
			timestamp,
		);
	}

	private async validateMarkRequest(req: MarkRequestRequestData) {
		const request = await dbRequests.getOpenRequest(req.id);
		if (request === null) {
			throw new BadRequestError('Request not found');
		}

		const activity = await this.getActivity(request.activityCode);

		const week = await getCurrentWeek();
		if (week < activity.startWeek || week > activity.endWeek) {
			throw new BadRequestError(
				`${request.activityCode} cannot be marked in week ${week}`,
			);
		}

		this.validateActivityMark(activity, req.mark);
	}

	//////////////////////////////////////////////////////////////////////////////

	async amendMark(user: SessionUser, req: AmendMarkRequestData) {
		logger.info('Amending mark', { user, req });

		await this.validateAmendMark(req);

		const timestamp = new Date();

		const res = await dbRequests.amendMark(req.id, user.zid, req.mark);

		if (res === null) {
			throw new InternalServerError(`Couldn't find request with id ${req.id}`);
		}

		await dbMarks.setMark(
			res.studentZid,
			res.activityCode,
			req.mark,
			timestamp,
		);

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
		const marker = await this.getUser(user.zid);

		tutorMessages.markAmended(res.classCode, req.id, marker.name, req.mark);
	}

	private async validateAmendMark(req: AmendMarkRequestData) {
		const request = await dbRequests.getMarkedRequest(req.id);
		if (request === null) {
			throw new BadRequestError('Request not found');
		}

		// A mark can only be amended on the same day as it was marked
		if (!isSameDay(request.markedAt, new Date())) {
			throw new BadRequestError('Too late to amend mark');
		}

		const activity = await this.getActivity(request.activityCode);

		this.validateActivityMark(activity, req.mark);

		if (req.mark === request.mark) {
			throw new BadRequestError('New mark must be different from current mark');
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//                             MANUAL REQUESTS                              //
	//////////////////////////////////////////////////////////////////////////////

	async createManualRequest(
		user: SessionUser,
		req: CreateManualRequestRequestData,
	) {
		logger.info('Creating manual request', { user, req });

		req = await this.validateCreateManualRequest(req);

		const timestamp = new Date();

		const res = await dbRequests.createManualRequest(
			req.studentZid,
			req.activityCode,
			req.reason,
			req.mark,
			user.zid,
			timestamp,
		);

		logger.info('Request successfully created', { user, res: { id: res.id } });

		await dbLogs.logManualRequestCreated(
			req.studentZid,
			req.activityCode,
			user.zid,
			req.mark,
			req.reason,
			timestamp,
		);
	}

	private async validateCreateManualRequest(
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

		this.validateActivityMark(activity, req.mark);

		return req;
	}

	//////////////////////////////////////////////////////////////////////////////

	async getAllManualRequests(user: SessionUser) {
		const requests = await dbRequests.getManualRequests();

		return toManualRequestList(requests);
	}

	//////////////////////////////////////////////////////////////////////////////

	async approveManualRequest(
		user: SessionUser,
		req: ApproveManualRequestRequestData,
	) {
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

		return toManualRequest(request);
	}

	//////////////////////////////////////////////////////////////////////////////

	async denyManualRequest(
		user: SessionUser,
		req: DenyManualRequestRequestData,
	) {
		logger.info('Denying manual request', { user, req });

		req = this.validateDenyManualRequest(req);

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

		return toManualRequest(request);
	}

	private validateDenyManualRequest(req: DenyManualRequestRequestData) {
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

	//////////////////////////////////////////////////////////////////////////////
	//                                 HELPERS                                  //
	//////////////////////////////////////////////////////////////////////////////

	private async getUser(zid: string) {
		const dbUser = await dbUsers.getUserByZid(zid);
		if (dbUser === null) {
			throw new InternalServerError(`Couldn't find user with zid ${zid}`);
		}
		return toUser(dbUser);
	}

	private async getStudent(zid: string) {
		const dbStudent = await dbUsers.getStudentByZid(zid);
		if (dbStudent === null) {
			throw new InternalServerError(`Couldn't find user with zid ${zid}`);
		}
		return toUser(dbStudent);
	}

	private async getClass(code: string) {
		const dbClass = await dbClasses.getClassDetails(code);
		if (dbClass === null) {
			throw new InternalServerError(`Couldn't find class with code ${code}`);
		}
		return toClass(dbClass);
	}

	private async getActivity(code: string) {
		const dbActivity = await dbActivities.getActivityByCode(code);
		if (dbActivity === null) {
			throw new InternalServerError(`Couldn't find activity with code ${code}`);
		}
		return dbActivity;
	}

	private async getPendingRequests(zid: string, activityCodes?: string[]) {
		const requests = await dbRequests.getOpenRequestsByUser(zid, activityCodes);

		return toPendingRequestList(requests);
	}

	private validateActivityMark(activity: ActivityAsTutor, mark: number) {
		if (mark < 0 || mark > activity.maxMark) {
			throw new BadRequestError('Invalid mark');
		}

		if (/\.\d{3}/.test(String(mark))) {
			throw new BadRequestError('Invalid mark');
		}
	}
}

const requestsService: BackendService<RequestsService> =
	new BackendRequestsService();

export default requestsService;
