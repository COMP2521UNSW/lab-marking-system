import * as React from 'react';

import type {
	MarkingRequestAsStudent,
	MarkingRequestAsTutor,
} from '@workspace/types/requests';

import { TimeAgo } from '@/components/ui/base/time-ago';

export function StudentRequestStatus({
	request,
	...props
}: React.ComponentProps<'span'> & {
	request: MarkingRequestAsStudent;
}) {
	return (
		<span {...props}>
			{request.status === 'pending' ? (
				<>
					requested <TimeAgo date={request.createdAt} />
				</>
			) : (
				<>
					{request.status === 'withdrawn'
						? 'withdrawn'
						: request.status === 'declined'
							? 'declined'
							: 'marked'}{' '}
					<TimeAgo date={request.closedAt} />
				</>
			)}
		</span>
	);
}

export function TutorRequestStatus({
	request,
	claimedBySelf = false,
	...props
}: React.ComponentProps<'span'> & {
	request: MarkingRequestAsTutor;
	claimedBySelf?: boolean;
}) {
	const when =
		request.status === 'pending' ? request.createdAt : request.closedAt;

	return (
		<span {...props}>
			{request.status === 'pending' && request.claimer !== null ? (
				`claimed by ${claimedBySelf ? 'you' : request.claimer.name.split(' ')[0]}`
			) : request.status === 'pending' ? (
				<>
					requested <TimeAgo date={request.createdAt} />
				</>
			) : (
				<>
					{request.status === 'withdrawn'
						? 'withdrawn'
						: request.status === 'declined'
							? 'declined'
							: 'marked'}{' '}
					<TimeAgo date={when} />
				</>
			)}
		</span>
	);
}
