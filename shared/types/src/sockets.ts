import type { ActiveClasses, Class } from './classes';
import type { OpenRequest, PendingRequest } from './requests';
import type { SessionUser, User } from './users';
import type { EmptyObject, Serialized } from './utils';

interface BaseServerToClientEvents {
	activeClasses: (classes: ActiveClasses) => void;
}

type StudentClientToServerEvents = EmptyObject;

interface StudentServerToClientEvents extends BaseServerToClientEvents {
	requestsUpdated: (cls: Class, requests: OpenRequest[]) => void;
	requestWithdrawn: (id: number) => void;
	requestDeclined: (id: number, reason: string) => void;
	requestMarked: (id: number, time: Date) => void;
}

interface TutorClientToServerEvents {
	viewClass: (classCode: string) => void;
}

interface TutorServerToClientEvents extends BaseServerToClientEvents {
	requestsCreated: (student: User, requests: PendingRequest[]) => void;
	studentJoined: (student: User, requests: PendingRequest[]) => void;
	studentLeft: (studentZid: string) => void;
	requestWithdrawn: (id: number, reason: string, time: Date) => void;
	requestClaimed: (id: number, tutor: User) => void;
	requestUnclaimed: (id: number) => void;
	requestDeclined: (
		id: number,
		tutorName: string,
		reason: string,
		time: Date,
	) => void;
	requestMarked: (
		id: number,
		markerName: string,
		mark: number,
		time: Date,
	) => void;
	markAmended: (id: number, markerName: string, mark: number) => void;
}

interface SocketData {
	user: SessionUser;
}

type SerializedSocketEvents<T extends object> = {
	[K in keyof T]: T[K] extends (...args: infer P) => infer R
		? (
				...args: {
					[K2 in keyof P]: Serialized<P[K2]>;
				}
			) => R
		: never;
};

export type {
	BaseServerToClientEvents,
	SerializedSocketEvents,
	SocketData,
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
};
