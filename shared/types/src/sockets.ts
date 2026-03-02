import type { ActiveClasses, Class } from './classes';
import type {
	MarkingRequestAsStudent,
	MarkingRequestAsTutor,
} from './requests';
import type { SessionUser, User } from './users';
import type { EmptyObject } from './utils';

type StudentClientToServerEvents = EmptyObject;

interface StudentServerToClientEvents {
	activeClasses: (classes: ActiveClasses) => void;
	requestsUpdated: (cls: Class, requests: MarkingRequestAsStudent[]) => void;
	requestWithdrawn: (id: number) => void;
	requestDeclined: (id: number, reason: string) => void;
	requestMarked: (id: number, time: Date) => void;
}

interface TutorClientToServerEvents {
	viewClass: (classCode: string) => void;
}

interface TutorServerToClientEvents {
	activeClasses: (classes: ActiveClasses) => void;
	requestsCreated: (student: User, requests: MarkingRequestAsTutor[]) => void;
	studentJoined: (student: User, requests: MarkingRequestAsTutor[]) => void;
	studentLeft: (studentZid: string) => void;
	requestWithdrawn: (id: number, time: Date) => void;
	requestDeclined: (id: number, time: Date) => void;
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

export type {
	SocketData,
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
};
