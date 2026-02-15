'use client';

import * as React from 'react';

import type { MarkedRequest } from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { AmendDialog } from './amend-dialog';

export type AmendDialogValue = {
	student: Student;
	request: MarkedRequest;
};

interface AmendDialogContextValue {
	amend: (student: Student, request: MarkedRequest) => void;
}

const AmendDialogContext = React.createContext<
	AmendDialogContextValue | undefined
>(undefined);

export function AmendDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<AmendDialogValue>();

	const amend = (student: Student, request: MarkedRequest) => {
		setValue({ student, request });
		setOpen(true);
	};

	return (
		<AmendDialogContext.Provider value={{ amend }}>
			{children}

			{value && (
				<AmendDialog
					open={open}
					setOpen={setOpen}
					student={value.student}
					request={value.request}
				/>
			)}
		</AmendDialogContext.Provider>
	);
}

export function useAmendDialog() {
	const ctx = React.useContext(AmendDialogContext);
	if (!ctx) {
		throw new Error('useAmendDialog must be used within AmendDialogProvider');
	}
	return ctx;
}
