import * as React from 'react';
import { useImmer } from 'use-immer';

import * as requestsService from '@/services/requests';
import { tutorSocket as socket } from '@/sockets/sockets';
import type { ActiveClasses, Class } from '@/types/classes';
import type {
	MarkingRequestAsTutor,
	StudentWithRequests,
} from '@/types/requests';
import type { Student } from '@/types/users';

type ContextValue = {
	activeClasses: ActiveClasses;
	selectedClass: Class | undefined;
	loadingRequests: boolean;
	openRequests: StudentWithRequests[];
	closedRequests: StudentWithRequests[];
	changeClass: (cls: Class) => Promise<void>;
	declineRequest: (id: number, reason: string) => Promise<void>;
	markRequest: (id: number, mark: number) => Promise<void>;
	amendMark: (id: number, mark: number) => Promise<void>;
};

const TutorRequestsContext = React.createContext<ContextValue | undefined>(
	undefined,
);

type RequestsState = {
	open: StudentWithRequests[];
	closed: StudentWithRequests[];
};

export function TutorRequestsProvider({
	activeClasses: initialActiveClasses,
	children,
}: {
	activeClasses: ActiveClasses;
	children: React.ReactNode;
}) {
	const [activeClasses, setActiveClasses] =
		React.useState(initialActiveClasses);

	const [selectedClass, setSelectedClass] = React.useState<Class | undefined>(
		undefined,
	);
	const [loadingRequests, setLoadingRequests] = React.useState(false);
	const [requests, updateRequests] = useImmer<RequestsState>({
		open: [],
		closed: [],
	});

	React.useEffect(() => {
		socket.connect();

		socket.on(
			'activeClasses', //
			(classes: ActiveClasses) => {
				setActiveClasses(classes);
			},
		);

		socket.on(
			'requestsCreated',
			(student: Student, requests: MarkingRequestAsTutor[]) => {
				updateRequests((draft) => {
					addRequests(draft.open, student, requests);
				});
			},
		);

		socket.on(
			'studentJoined',
			(student: Student, requests: MarkingRequestAsTutor[]) => {
				updateRequests((draft) => {
					draft.open.push({ student, requests });
				});
			},
		);

		socket.on(
			'studentLeft', //
			(studentZid: string) => {
				updateRequests((draft) => {
					draft.open = draft.open.filter(
						(requests) => requests.student.zid !== studentZid,
					);
				});
			},
		);

		socket.on(
			'requestWithdrawn', //
			(id: number, time: Date) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'withdrawn',
						closedAt: new Date(time),
					})),
				);
			},
		);

		socket.on(
			'requestDeclined', //
			(id: number, time: Date) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'declined',
						closedAt: time,
					})),
				);
			},
		);

		socket.on(
			'requestMarked', //
			(id: number, markerName: string, mark: number, time: Date) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'marked',
						closedAt: time,
						markerName,
						mark,
					})),
				);
			},
		);

		socket.on(
			'markAmended', //
			(id: number, markerName: string, mark: number) => {
				updateRequests((draft) => {
					const { studentIndex, requestIndex } = findRequest(draft.closed, id);

					if (studentIndex === -1 || requestIndex === -1) return;

					const req = draft.closed[studentIndex].requests[requestIndex];
					if (req.status === 'marked') {
						req.markerName = markerName;
						req.mark = mark;
					}
				});
			},
		);

		return () => {
			socket.off();
			socket.disconnect();
		};
	}, [updateRequests]);

	const changeClass = async (cls: Class) => {
		setSelectedClass(cls);

		setLoadingRequests(true);
		socket.emit('viewClass', cls.code);
		const requests = await requestsService.getRequestsByClass({
			classCode: cls.code,
		});
		updateRequests(sortRequests(requests));
		setLoadingRequests(false);
	};

	const declineRequest = async (id: number, reason: string) => {
		await requestsService.declineRequest({ id, reason });
	};

	const markRequest = async (id: number, mark: number) => {
		await requestsService.markRequest({ id, mark });
	};

	const amendMark = async (id: number, mark: number) => {
		await requestsService.amendMark({ id, mark });
	};

	return (
		<TutorRequestsContext.Provider
			value={{
				activeClasses,
				selectedClass,
				loadingRequests,
				openRequests: requests.open,
				closedRequests: requests.closed,
				changeClass,
				markRequest,
				declineRequest,
				amendMark,
			}}
		>
			{children}
		</TutorRequestsContext.Provider>
	);
}

////////////////////////////////////////////////////////////////////////////////

function sortRequests(students: StudentWithRequests[]) {
	const res: {
		open: StudentWithRequests[];
		closed: StudentWithRequests[];
	} = {
		open: [],
		closed: [],
	};

	for (const stu of students) {
		const groups = Object.groupBy(stu.requests, (req) =>
			req.closedAt === null ? 'open' : 'closed',
		);
		if (groups.open) {
			res.open.push({ student: stu.student, requests: groups.open });
		}
		if (groups.closed) {
			res.closed.push({ student: stu.student, requests: groups.closed });
		}
	}

	return res;
}

function addRequests(
	students: StudentWithRequests[],
	student: Student,
	newRequests: MarkingRequestAsTutor[],
) {
	const studentIndex = students.findIndex(
		(stu) => stu.student.zid === student.zid,
	);

	if (studentIndex === -1) {
		students.push({ student, requests: newRequests });
	} else {
		students[studentIndex].requests.push(...newRequests);
	}
}

function removeRequest(students: StudentWithRequests[], id: number) {
	const { studentIndex, requestIndex } = findRequest(students, id);

	if (studentIndex === -1 || requestIndex === -1) return;

	const res = {
		student: students[studentIndex].student,
		request: students[studentIndex].requests[requestIndex],
	};

	if (students[studentIndex].requests.length === 1) {
		students.splice(studentIndex, 1);
	} else {
		students[studentIndex].requests.splice(requestIndex, 1);
	}
	return res;
}

function closeRequest(
	requests: RequestsState,
	id: number,
	requestTransformer: (req: MarkingRequestAsTutor) => MarkingRequestAsTutor,
) {
	const res = removeRequest(requests.open, id);
	if (res === undefined) return;

	addRequests(requests.closed, res.student, [requestTransformer(res.request)]);
}

function findRequest(students: StudentWithRequests[], id: number) {
	for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
		const requests = students[studentIndex].requests;
		for (let requestIndex = 0; requestIndex < requests.length; requestIndex++) {
			const request = requests[requestIndex];
			if (request.id === id) {
				return { studentIndex, requestIndex };
			}
		}
	}

	return { studentIndex: -1, requestIndex: -1 };
}

////////////////////////////////////////////////////////////////////////////////

export function useTutorRequests() {
	const value = React.useContext(TutorRequestsContext);
	if (value === undefined) {
		throw new Error(
			'useTutorRequests must be used within <TutorRequestsProvider>',
		);
	}

	return value;
}
