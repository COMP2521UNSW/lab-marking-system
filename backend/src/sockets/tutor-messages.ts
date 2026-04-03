import type { Temporal } from 'temporal-polyfill';

import type { PendingRequest } from '@workspace/types/requests';
import type { User } from '@workspace/types/users';

import { tutorSocket } from '@/server';

function requestsCreated(
	classCode: string,
	student: User,
	requests: PendingRequest[],
) {
	tutorSocket.to(classCode).emit('requestsCreated', student, requests);
}

function studentJoined(
	classCode: string,
	student: User,
	requests: PendingRequest[],
) {
	tutorSocket.to(classCode).emit('studentJoined', student, requests);
}

function studentLeft(classCode: string, studentZid: string) {
	tutorSocket.to(classCode).emit('studentLeft', studentZid);
}

function requestWithdrawn(
	classCode: string,
	id: number,
	reason: string,
	timestamp: Temporal.Instant,
) {
	tutorSocket.to(classCode).emit('requestWithdrawn', id, reason, timestamp);
}

function requestClaimed(classCode: string, id: number, claimer: User) {
	tutorSocket.to(classCode).emit('requestClaimed', id, claimer);
}

function requestUnclaimed(classCode: string, id: number) {
	tutorSocket.to(classCode).emit('requestUnclaimed', id);
}

function requestDeclined(
	classCode: string,
	id: number,
	tutorName: string,
	reason: string,
	timestamp: Temporal.Instant,
) {
	tutorSocket
		.to(classCode)
		.emit('requestDeclined', id, tutorName, reason, timestamp);
}

function requestMarked(
	classCode: string,
	id: number,
	markerName: string,
	mark: number,
	timestamp: Temporal.Instant,
) {
	tutorSocket
		.to(classCode)
		.emit('requestMarked', id, markerName, mark, timestamp);
}

function markAmended(
	classCode: string,
	id: number,
	markerName: string,
	mark: number,
) {
	tutorSocket.to(classCode).emit('markAmended', id, markerName, mark);
}

export {
	markAmended,
	requestClaimed,
	requestDeclined,
	requestMarked,
	requestUnclaimed,
	requestWithdrawn,
	requestsCreated,
	studentJoined,
	studentLeft,
};
