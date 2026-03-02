'use client';

import * as React from 'react';

import { DenyDialog } from './deny-dialog';

interface DenyDialogContextValue {
	deny: (onConfirmed: (reason: string) => Promise<void>) => void;
}

const DenyDialogContext = React.createContext<
	DenyDialogContextValue | undefined
>(undefined);

export function DenyDialogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	const [onConfirmed, setOnConfirmed] = React.useState<
		(reason: string) => Promise<void>
	>(async () => {});

	const deny = (onConfirmed: (reason: string) => Promise<void>) => {
		setOnConfirmed(() => onConfirmed);
		setOpen(true);
	};

	return (
		<DenyDialogContext.Provider value={{ deny }}>
			{children}

			<DenyDialog open={open} setOpen={setOpen} onConfirmed={onConfirmed} />
		</DenyDialogContext.Provider>
	);
}

export function useDenyDialog() {
	const ctx = React.useContext(DenyDialogContext);
	if (!ctx) {
		throw new Error('useDenyDialog must be used within DenyDialogProvider');
	}
	return ctx;
}
