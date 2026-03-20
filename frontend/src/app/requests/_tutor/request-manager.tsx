import * as React from 'react';
import { useImmer } from 'use-immer';

import type { Class } from '@workspace/types/classes';
import type {
	MarkingRequestAsTutor,
	PendingRequest,
	StudentWithRequests,
} from '@workspace/types/requests';
import type { Student, User } from '@workspace/types/users';
import type { JSONified } from '@workspace/types/utils';

import { useTutorSocket } from '@/components/providers/socket-provider';
import * as requestsService from '@/services/requests';

type RequestsState = {
	open: StudentWithRequests[];
	closed: StudentWithRequests[];
};

export function useRequestManager() {
	const { socket, addReconnectHandler, removeReconnectHandler } =
		useTutorSocket();

	const classRef = React.useRef<Class | undefined>(undefined);
	const [requests, updateRequests] = useImmer<RequestsState>({
		open: [],
		closed: [],
	});

	const loadClass = React.useCallback(
		async (cls: Class) => {
			socket.emit('viewClass', cls.code);
			const requests = await requestsService.getRequestsByClass({
				classCode: cls.code,
			});
			updateRequests(sortRequests(requests));
		},
		[socket, updateRequests],
	);

	const changeClass = React.useCallback(
		async (cls: Class) => {
			classRef.current = cls;
			await loadClass(cls);
		},
		[loadClass],
	);

	React.useEffect(() => {
		const handleReconnect = async () => {
			if (classRef.current !== undefined) {
				await loadClass(classRef.current);
			}
		};
		addReconnectHandler(handleReconnect);

		socket.on(
			'requestsCreated', //
			(student: Student, requests: JSONified<PendingRequest[]>) => {
				updateRequests((draft) => {
					addRequests(
						draft.open,
						student,
						requests.map((request) => ({
							...request,
							createdAt: new Date(request.createdAt),
						})),
					);
				});
			},
		);

		socket.on(
			'studentJoined', //
			(student: Student, requests: JSONified<PendingRequest[]>) => {
				updateRequests((draft) => {
					draft.open.push({
						student,
						requests: requests.map((request) => ({
							...request,
							createdAt: new Date(request.createdAt),
						})),
					});
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
			(id: number, reason: string, time: JSONified<Date>) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'withdrawn',
						closedAt: new Date(time),
						reason,
					})),
				);
			},
		);

		socket.on(
			'requestClaimed', //
			(id: number, tutor: User) => {
				updateRequests((draft) =>
					updateRequest(draft.open, id, (req) => ({
						...req,
						claimer: tutor,
					})),
				);
			},
		);

		socket.on(
			'requestUnclaimed', //
			(id: number) => {
				updateRequests((draft) =>
					updateRequest(draft.open, id, (req) => {
						if (req.status === 'pending') {
							return { ...req, claimer: null };
						} else {
							return req;
						}
					}),
				);
			},
		);

		socket.on(
			'requestDeclined', //
			(
				id: number,
				tutorName: string,
				reason: string,
				time: JSONified<Date>,
			) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'declined',
						closedAt: new Date(time),
						tutorName,
						reason,
					})),
				);
			},
		);

		socket.on(
			'requestMarked', //
			(id: number, markerName: string, mark: number, time: JSONified<Date>) => {
				updateRequests((draft) =>
					closeRequest(draft, id, (req) => ({
						...req,
						status: 'marked',
						closedAt: new Date(time),
						markerName,
						mark,
					})),
				);
			},
		);

		socket.on(
			'markAmended', //
			(id: number, markerName: string, mark: number) => {
				updateRequests((draft) =>
					updateRequest(draft.closed, id, (req) => ({
						...req,
						markerName,
						mark,
					})),
				);
			},
		);

		return () => {
			removeReconnectHandler(handleReconnect);
			socket.off('requestsCreated');
			socket.off('studentJoined');
			socket.off('studentLeft');
			socket.off('requestWithdrawn');
			socket.off('requestClaimed');
			socket.off('requestUnclaimed');
			socket.off('requestDeclined');
			socket.off('requestMarked');
			socket.off('markAmended');
		};
	}, [
		socket,
		updateRequests,
		loadClass,
		addReconnectHandler,
		removeReconnectHandler,
	]);

	return {
		openRequests: requests.open,
		closedRequests: requests.closed,
		changeClass,
	};
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

function updateRequest(
	students: StudentWithRequests[],
	id: number,
	requestTransformer: (req: MarkingRequestAsTutor) => MarkingRequestAsTutor,
) {
	const { studentIndex, requestIndex } = findRequest(students, id);

	if (studentIndex === -1) return;

	const request = students[studentIndex].requests[requestIndex];
	students[studentIndex].requests[requestIndex] = requestTransformer(request);
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
