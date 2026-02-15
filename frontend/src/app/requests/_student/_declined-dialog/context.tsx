'use client';

import * as React from 'react';

import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { DeclinedDialog } from './declined-dialog';

type DeclinedRequest = {
	request: MarkingRequestAsStudent;
	reason: string;
};

type DeclinedDialogContextValue = {
	declined: (request: MarkingRequestAsStudent, reason: string) => void;
};

const DeclinedDialogContext = React.createContext<
	DeclinedDialogContextValue | undefined
>(undefined);

export function DeclinedDialogProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [declinedRequests, setDeclinedRequests] = React.useState<
		DeclinedRequest[]
	>([]);

	const declined = React.useCallback(
		(request: MarkingRequestAsStudent, reason: string) => {
			setDeclinedRequests((declinedRequests) => [
				...declinedRequests,
				{ request, reason },
			]);
		},
		[],
	);

	const acknowledged = (id: number) => {
		setTimeout(() => {
			setDeclinedRequests((declinedRequests) =>
				declinedRequests.filter(({ request }) => request.id !== id),
			);
		}, 200);
	};

	return (
		<DeclinedDialogContext.Provider value={{ declined }}>
			{children}

			{declinedRequests.map(({ request, reason }) => (
				<DeclinedDialog
					key={request.activity.code}
					request={request}
					reason={reason}
					onClose={() => acknowledged(request.id)}
				/>
			))}
		</DeclinedDialogContext.Provider>
	);
}

export function useDeclinedDialog() {
	const ctx = React.useContext(DeclinedDialogContext);
	if (!ctx) {
		throw new Error(
			'useDeclinedDialog must be used within DeclinedDialogProvider',
		);
	}
	return ctx;
}
