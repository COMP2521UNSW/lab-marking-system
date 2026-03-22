import type { ActiveClasses, Class } from './classes';
import type { OpenRequest, PendingRequest } from './requests';
import type { SessionUser, User } from './users';
import type { EmptyObject, JSONified } from './utils';

interface BaseServerToClientEvents {
	activeClasses: (classes: ActiveClasses) => void;
}

type StudentClientToServerEvents = EmptyObject;

interface StudentServerToClientEvents extends BaseServerToClientEvents {
	requestsUpdated: (cls: Class, requests: JSONified<OpenRequest[]>) => void;
	requestWithdrawn: (id: number) => void;
	requestDeclined: (id: number, reason: string) => void;
	requestMarked: (id: number, time: JSONified<Date>) => void;
}

interface TutorClientToServerEvents {
	viewClass: (classCode: string) => void;
}

interface TutorServerToClientEvents extends BaseServerToClientEvents {
	requestsCreated: (
		student: User,
		requests: JSONified<PendingRequest[]>,
	) => void;
	studentJoined: (student: User, requests: JSONified<PendingRequest[]>) => void;
	studentLeft: (studentZid: string) => void;
	requestWithdrawn: (id: number, reason: string, time: JSONified<Date>) => void;
	requestClaimed: (id: number, tutor: User) => void;
	requestUnclaimed: (id: number) => void;
	requestDeclined: (
		id: number,
		tutorName: string,
		reason: string,
		time: JSONified<Date>,
	) => void;
	requestMarked: (
		id: number,
		markerName: string,
		mark: number,
		time: JSONified<Date>,
	) => void;
	markAmended: (id: number, markerName: string, mark: number) => void;
}

interface SocketData {
	user: SessionUser;
}

export type {
	BaseServerToClientEvents,
	SocketData,
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
};
