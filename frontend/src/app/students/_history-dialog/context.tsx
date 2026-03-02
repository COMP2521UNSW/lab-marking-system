'use client';

import * as React from 'react';

import type { Student } from '@workspace/types/users';

import { HistoryDialog } from './history-dialog';

interface HistoryDialogContextValue {
	viewHistory: (student: Student) => void;
}

const HistoryDialogContext = React.createContext<
	HistoryDialogContextValue | undefined
>(undefined);

export function HistoryDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [student, setStudent] = React.useState<Student>();

	const viewHistory = (student: Student) => {
		setStudent(student);
		setOpen(true);
	};

	return (
		<HistoryDialogContext.Provider value={{ viewHistory }}>
			{children}

			{student && (
				<HistoryDialog open={open} setOpen={setOpen} student={student} />
			)}
		</HistoryDialogContext.Provider>
	);
}

export function useHistoryDialog() {
	const ctx = React.useContext(HistoryDialogContext);
	if (!ctx) {
		throw new Error(
			'useHistoryDialog must be used within HistoryDialogProvider',
		);
	}
	return ctx;
}
