'use client';

import * as React from 'react';

import type { ActivityWithStatus } from '@workspace/types/activities';
import type { Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { UpdateRequestsDialog } from './update-requests-dialog';

type Mode = 'create' | 'edit';

interface UpdateRequestsDialogContextValue {
	updateRequests: (
		mode: Mode,
		attendedClass: Class | null,
		pendingRequests: MarkingRequestAsStudent[],
		activeActivities: ActivityWithStatus[],
	) => void;
}

const UpdateRequestsDialogContext = React.createContext<
	UpdateRequestsDialogContextValue | undefined
>(undefined);

export function UpdateRequestsDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [mode, setMode] = React.useState<Mode>('create');
	const [attendedClass, setAttendedClass] = React.useState<Class | null>(null);
	const [pendingRequests, setPendingRequests] = React.useState<
		MarkingRequestAsStudent[]
	>([]);
	const [activeActivities, setActiveActivities] = React.useState<
		ActivityWithStatus[]
	>([]);

	const updateRequests = (
		mode: Mode,
		attendedClass: Class | null,
		pendingRequests: MarkingRequestAsStudent[],
		activeActivities: ActivityWithStatus[],
	) => {
		setMode(mode);
		setAttendedClass(attendedClass);
		setPendingRequests(pendingRequests);
		setActiveActivities(activeActivities);
		setOpen(true);
	};

	return (
		<UpdateRequestsDialogContext.Provider value={{ updateRequests }}>
			{children}

			<UpdateRequestsDialog
				open={open}
				setOpen={setOpen}
				mode={mode}
				attendedClass={attendedClass}
				pendingRequests={pendingRequests}
				activeActivities={activeActivities}
			/>
		</UpdateRequestsDialogContext.Provider>
	);
}

export function useUpdateRequestsDialog() {
	const ctx = React.useContext(UpdateRequestsDialogContext);
	if (!ctx) {
		throw new Error(
			'useUpdateRequestsDialog must be used within UpdateRequestsDialogProvider',
		);
	}
	return ctx;
}
