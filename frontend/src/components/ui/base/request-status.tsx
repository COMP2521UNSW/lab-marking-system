import * as React from 'react';

import type { RequestStatus } from '@workspace/types/requests';

import { TimeAgo } from '@/components/ui/base/time-ago';

export function RequestStatus({
	status,
	when,
	...props
}: React.ComponentProps<'span'> & {
	status: RequestStatus;
	when: Date;
}) {
	return (
		<span {...props}>
			{status === 'pending'
				? 'requested'
				: status === 'withdrawn'
					? 'withdrawn'
					: status === 'declined'
						? 'declined'
						: status === 'marked'
							? 'marked'
							: 'requested'}{' '}
			<TimeAgo date={when} />
		</span>
	);
}
