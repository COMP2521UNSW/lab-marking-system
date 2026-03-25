import * as React from 'react';

import type { ActivityWithStatus } from '@workspace/types/activities';
import type { Class } from '@workspace/types/classes';
import type {
	MarkingRequestAsStudent,
	OpenRequest,
} from '@workspace/types/requests';
import type { JSONified } from '@workspace/types/utils';

import { useStudentSocket } from '@/components/providers/socket-provider';
import pagesService from '@/services/pages';

import { useDeclinedDialog } from './_declined-dialog/context';

export function useRequestManager(
	initialAttendedClass: Class | null,
	initialRequests: MarkingRequestAsStudent[],
	initialActiveActivities: ActivityWithStatus[],
) {
	const { socket, addReconnectHandler, removeReconnectHandler } =
		useStudentSocket();

	const { declined } = useDeclinedDialog();

	const [attendedClass, setAttendedClass] =
		React.useState(initialAttendedClass);
	const [requests, setRequests] = React.useState(initialRequests);

	const [activeActivities, setActiveActivities] = React.useState(
		initialActiveActivities,
	);

	const requestsRef = React.useRef(requests);

	React.useEffect(() => {
		requestsRef.current = requests;
	}, [requests]);

	React.useEffect(() => {
		const handleReconnect = async () => {
			const { activeActivities, requestDetails } =
				await pagesService.getStudentRequestsPage();
			setAttendedClass(requestDetails.class);
			setRequests(requestDetails.requests);
			setActiveActivities(activeActivities);
		};
		addReconnectHandler(handleReconnect);

		socket.on(
			'requestsUpdated', //
			(cls: Class, newRequests: JSONified<OpenRequest[]>) => {
				setAttendedClass(cls);
				setRequests((requests) =>
					requests.concat(
						newRequests.map((request) => ({
							...request,
							createdAt: new Date(request.createdAt),
						})),
					),
				);
			},
		);

		socket.on(
			'requestWithdrawn', //
			(id: number) => {
				setRequests((requests) =>
					requests.filter((request) => request.id !== id),
				);
			},
		);

		socket.on(
			'requestDeclined', //
			(id: number, reason: string) => {
				const request = requestsRef.current.find((r) => r.id === id);

				if (request) {
					declined(request, reason);
					setRequests((requests) => requests.filter((r) => r.id !== id));
				}
			},
		);

		socket.on(
			'requestMarked', //
			(id: number, time: JSONified<Date>) => {
				const request = requestsRef.current.find((r) => r.id === id);

				if (!request) return;

				setActiveActivities((activeActivities) =>
					activeActivities.map((activeActivity) =>
						activeActivity.activity.code === request.activity.code
							? { ...activeActivity, marked: true }
							: activeActivity,
					),
				);

				setRequests((requests) =>
					requests.map((request) => {
						if (request.id === id) {
							return { ...request, status: 'marked', closedAt: new Date(time) };
						} else {
							return request;
						}
					}),
				);
			},
		);

		return () => {
			removeReconnectHandler(handleReconnect);
			socket.off('requestsUpdated');
			socket.off('requestWithdrawn');
			socket.off('requestDeclined');
			socket.off('requestMarked');
		};
	}, [socket, addReconnectHandler, removeReconnectHandler, declined]);

	return {
		attendedClass,
		requests,
		activeActivities,
	};
}
