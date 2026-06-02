'use client';

import * as React from 'react';

import { ConfirmClaimDialog } from './dialog';

export type ConfirmClaimDialogValue = {
	tutorName: string;
};

interface ConfirmClaimContextValue {
	confirmClaim: (tutorName: string) => Promise<boolean>;
}

const ConfirmClaimDialogContext = React.createContext<
	ConfirmClaimContextValue | undefined
>(undefined);

export function ConfirmClaimDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [value, setValue] = React.useState<ConfirmClaimDialogValue>();
	const [resolver, setResolver] =
		React.useState<(value: boolean | PromiseLike<boolean>) => void>();

	const confirmClaim = (tutorName: string) => {
		setValue({ tutorName });
		setOpen(true);
		return new Promise<boolean>((res) => {
			setResolver(() => res);
		});
	};

	const handleConfirm = () => {
		resolver?.(true);
		setOpen(false);
	};

	const handleCancel = () => {
		resolver?.(false);
		setOpen(false);
	};

	return (
		<ConfirmClaimDialogContext.Provider value={{ confirmClaim }}>
			{children}

			{value && (
				<ConfirmClaimDialog
					open={open}
					tutorName={value.tutorName}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</ConfirmClaimDialogContext.Provider>
	);
}

export function useConfirmClaimDialog() {
	const ctx = React.useContext(ConfirmClaimDialogContext);
	if (!ctx) {
		throw new Error(
			'useConfirmClaimDialog must be used within ConfirmClaimDialogProvider',
		);
	}
	return ctx;
}
