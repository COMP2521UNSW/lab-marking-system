'use client';

import * as React from 'react';

import type { MarkingRequestAsTutor } from '@/types/requests';
import type { Student } from '@/types/users';

import { MarkDialog } from './mark-dialog';

export type MarkDialogValue = {
	student: Student;
	request: MarkingRequestAsTutor;
};

interface MarkDialogContextValue {
	mark: (student: Student, request: MarkingRequestAsTutor) => void;
}

const MarkDialogContext = React.createContext<
	MarkDialogContextValue | undefined
>(undefined);

export function MarkDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<MarkDialogValue>();

	const mark = (student: Student, request: MarkingRequestAsTutor) => {
		setValue({ student, request });
		setOpen(true);
	};

	return (
		<MarkDialogContext.Provider value={{ mark }}>
			{children}

			{value && (
				<MarkDialog
					open={open}
					setOpen={setOpen}
					student={value.student}
					request={value.request}
				/>
			)}
		</MarkDialogContext.Provider>
	);
}

export function useMarkDialog() {
	const ctx = React.useContext(MarkDialogContext);
	if (!ctx) {
		throw new Error('useMarkDialog must be used within MarkDialogProvider');
	}
	return ctx;
}
