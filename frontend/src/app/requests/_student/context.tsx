import * as React from 'react';

import type { ActivityWithStatus } from '@workspace/types/activities';
import type { ActiveClasses, Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { studentSocket as socket } from '@/sockets/sockets';

import { useDeclinedDialog } from './_declined-dialog/context';

type ContextValue = {
	attendedClass: Class | null;
	requests: MarkingRequestAsStudent[];
	activeClasses: ActiveClasses;
	activeActivities: ActivityWithStatus[];
};

const StudentRequestsContext = React.createContext<ContextValue | undefined>(
	undefined,
);

export function StudentRequestsProvider({
	activeClasses: initialActiveClasses,
	activeActivities: initialActiveActivities,
	attendedClass: initialAttendedClass,
	requests: initialRequests,
	children,
}: {
	activeClasses: ActiveClasses;
	activeActivities: ActivityWithStatus[];
	attendedClass: Class | null;
	requests: MarkingRequestAsStudent[];
	children: React.ReactNode;
}) {
	const { declined } = useDeclinedDialog();

	const [activeClasses, setActiveClasses] =
		React.useState<ActiveClasses>(initialActiveClasses);
	const [activeActivities, setActiveActivities] = React.useState(
		initialActiveActivities,
	);

	const [attendedClass, setAttendedClass] =
		React.useState(initialAttendedClass);
	const [requests, setRequests] = React.useState(initialRequests);

	const requestsRef = React.useRef(requests);

	React.useEffect(() => {
		requestsRef.current = requests;
	}, [requests]);

	React.useEffect(() => {
		socket.connect();

		socket.on(
			'activeClasses', //
			(classes) => {
				setActiveClasses(classes);
			},
		);

		socket.on(
			'requestsUpdated', //
			(cls: Class, newRequests: MarkingRequestAsStudent[]) => {
				setAttendedClass(cls);
				setRequests((requests) => requests.concat(newRequests));
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
			(id: number, time: Date) => {
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
							return { ...request, status: 'marked', closedAt: time };
						} else {
							return request;
						}
					}),
				);
			},
		);

		return () => {
			socket.off();
			socket.disconnect();
		};
	}, [declined]);

	return (
		<StudentRequestsContext.Provider
			value={{
				attendedClass,
				requests,
				activeClasses,
				activeActivities,
			}}
		>
			{children}
		</StudentRequestsContext.Provider>
	);
}

export function useStudentRequests() {
	const value = React.useContext(StudentRequestsContext);
	if (value === undefined) {
		throw new Error(
			'useStudentRequests must be used within <StudentRequestsProvider>',
		);
	}

	return value;
}
