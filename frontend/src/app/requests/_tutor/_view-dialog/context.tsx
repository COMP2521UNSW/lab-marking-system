'use client';

import * as React from 'react';

import type {
	DeclinedRequest,
	WithdrawnRequest,
} from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { ViewDialog } from './view-dialog';

export type ViewDialogValue = {
	student: Student;
	request: WithdrawnRequest | DeclinedRequest;
};

interface ViewDialogContextValue {
	view: (student: Student, request: WithdrawnRequest | DeclinedRequest) => void;
}

const ViewDialogContext = React.createContext<
	ViewDialogContextValue | undefined
>(undefined);

export function ViewDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<ViewDialogValue>();

	const view = (
		student: Student,
		request: WithdrawnRequest | DeclinedRequest,
	) => {
		setValue({ student, request });
		setOpen(true);
	};

	return (
		<ViewDialogContext.Provider value={{ view }}>
			{children}

			{value && (
				<ViewDialog
					open={open}
					setOpen={setOpen}
					student={value.student}
					request={value.request}
				/>
			)}
		</ViewDialogContext.Provider>
	);
}

export function useViewDialog() {
	const ctx = React.useContext(ViewDialogContext);
	if (!ctx) {
		throw new Error('useViewDialog must be used within ViewDialogProvider');
	}
	return ctx;
}
