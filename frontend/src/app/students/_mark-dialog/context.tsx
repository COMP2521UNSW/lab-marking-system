'use client';

import * as React from 'react';

import type { ActivityAsTutor } from '@/types/activities';
import type { Student } from '@/types/users';

import { MarkDialog } from './mark-dialog';

interface MarkDialogContextValue {
	markStudent: (student: Student) => void;
}

const MarkDialogContext = React.createContext<
	MarkDialogContextValue | undefined
>(undefined);

export function MarkDialogProvider({
	activities,
	children,
}: {
	activities: ActivityAsTutor[];
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [student, setStudent] = React.useState<Student>();

	const markStudent = (student: Student) => {
		setStudent(student);
		setOpen(true);
	};

	return (
		<MarkDialogContext.Provider value={{ markStudent }}>
			{children}

			{student && (
				<MarkDialog
					open={open}
					setOpen={setOpen}
					student={student}
					activities={activities}
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
