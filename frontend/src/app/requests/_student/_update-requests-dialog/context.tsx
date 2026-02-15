'use client';

import * as React from 'react';

import type { Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { UpdateRequestsDialog } from './update-requests-dialog';

type Mode = 'create' | 'edit';

interface UpdateRequestsDialogContextValue {
	updateRequests: (
		mode: Mode,
		attendedClass: Class | null,
		requests: MarkingRequestAsStudent[],
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
	const [currentRequests, setCurrentRequests] = React.useState<
		MarkingRequestAsStudent[]
	>([]);

	const updateRequests = (
		mode: Mode,
		attendedClass: Class | null,
		currentRequests: MarkingRequestAsStudent[],
	) => {
		setMode(mode);
		setAttendedClass(attendedClass);
		setCurrentRequests(currentRequests);
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
				currentRequests={currentRequests}
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
