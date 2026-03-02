import type { Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { studentSocket } from '@/server';

function requestsUpdated(
	zid: string,
	cls: Class,
	requests: MarkingRequestAsStudent[],
) {
	studentSocket.to(zid).emit('requestsUpdated', cls, requests);
}

function requestWithdrawn(zid: string, id: number) {
	studentSocket.to(zid).emit('requestWithdrawn', id);
}

function requestDeclined(zid: string, id: number, reason: string) {
	studentSocket.to(zid).emit('requestDeclined', id, reason);
}

function requestMarked(zid: string, id: number, time: Date) {
	studentSocket.to(zid).emit('requestMarked', id, time);
}

export { requestDeclined, requestMarked, requestsUpdated, requestWithdrawn };
