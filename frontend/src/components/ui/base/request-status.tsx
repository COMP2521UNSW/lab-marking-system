import * as React from 'react';

import { TimeAgo } from '@/components/ui/base/time-ago';
import type { RequestStatus } from '@/types/requests';

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
