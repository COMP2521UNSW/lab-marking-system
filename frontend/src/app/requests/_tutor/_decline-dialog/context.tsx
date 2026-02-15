'use client';

import * as React from 'react';

import type { MarkingRequestAsTutor } from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { DeclineDialog } from './decline-dialog';

export type DeclineDialogValue = {
	student: Student;
	request: MarkingRequestAsTutor;
};

interface DeclineDialogContextValue {
	decline: (student: Student, request: MarkingRequestAsTutor) => void;
}

const DeclineDialogContext = React.createContext<
	DeclineDialogContextValue | undefined
>(undefined);

export function DeclineDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<DeclineDialogValue>();

	const decline = (student: Student, request: MarkingRequestAsTutor) => {
		setValue({ student, request });
		setOpen(true);
	};

	return (
		<DeclineDialogContext.Provider value={{ decline }}>
			{children}

			{value && (
				<DeclineDialog open={open} setOpen={setOpen} request={value.request} />
			)}
		</DeclineDialogContext.Provider>
	);
}

export function useDeclineDialog() {
	const ctx = React.useContext(DeclineDialogContext);
	if (!ctx) {
		throw new Error(
			'useDeclineDialog must be used within DeclineDialogProvider',
		);
	}
	return ctx;
}
