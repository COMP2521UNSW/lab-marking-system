import { tutorSocket } from '@/server';
import type { MarkingRequestAsTutor } from '@/types/requests';
import type { User } from '@/types/users';

function requestsCreated(
	classCode: string,
	student: User,
	requests: MarkingRequestAsTutor[],
) {
	tutorSocket.to(classCode).emit('requestsCreated', student, requests);
}

function studentJoined(
	classCode: string,
	student: User,
	requests: MarkingRequestAsTutor[],
) {
	tutorSocket.to(classCode).emit('studentJoined', student, requests);
}

function studentLeft(classCode: string, studentZid: string) {
	tutorSocket.to(classCode).emit('studentLeft', studentZid);
}

function requestWithdrawn(classCode: string, id: number, time: Date) {
	tutorSocket.to(classCode).emit('requestWithdrawn', id, time);
}

function requestDeclined(classCode: string, id: number, time: Date) {
	tutorSocket.to(classCode).emit('requestDeclined', id, time);
}

function requestMarked(
	classCode: string,
	id: number,
	markerName: string,
	mark: number,
	time: Date,
) {
	tutorSocket.to(classCode).emit('requestMarked', id, markerName, mark, time);
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
	requestDeclined,
	requestMarked,
	requestsCreated,
	requestWithdrawn,
	studentJoined,
	studentLeft,
};
