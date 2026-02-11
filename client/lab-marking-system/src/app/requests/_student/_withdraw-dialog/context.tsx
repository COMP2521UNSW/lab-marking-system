'use client';

import * as React from 'react';

import type { MarkingRequestAsStudent } from '@/types/requests';

import { WithdrawDialog } from './withdraw-dialog';

type WithdrawDialogValue = {
	request: MarkingRequestAsStudent;
};

interface WithdrawDialogContextValue {
	withdraw: (request: MarkingRequestAsStudent) => void;
}

const WithdrawDialogContext = React.createContext<
	WithdrawDialogContextValue | undefined
>(undefined);

export function WithdrawDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<WithdrawDialogValue>();

	const withdraw = (request: MarkingRequestAsStudent) => {
		setValue({ request });
		setOpen(true);
	};

	return (
		<WithdrawDialogContext.Provider value={{ withdraw }}>
			{children}

			{value && (
				<WithdrawDialog open={open} setOpen={setOpen} request={value.request} />
			)}
		</WithdrawDialogContext.Provider>
	);
}

export function useWithdrawDialog() {
	const ctx = React.useContext(WithdrawDialogContext);
	if (!ctx) {
		throw new Error(
			'useWithdrawDialog must be used within WithdrawDialogProvider',
		);
	}
	return ctx;
}
