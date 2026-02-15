'use client';

import * as React from 'react';

import type { Student } from '@workspace/types/users';

import { ViewDialog } from './view-dialog';

interface ViewDialogContextValue {
	viewMarks: (student: Student) => void;
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

	const [student, setStudent] = React.useState<Student>();

	const viewMarks = (student: Student) => {
		setStudent(student);
		setOpen(true);
	};

	return (
		<ViewDialogContext.Provider value={{ viewMarks }}>
			{children}

			{student && (
				<ViewDialog open={open} setOpen={setOpen} student={student} />
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
