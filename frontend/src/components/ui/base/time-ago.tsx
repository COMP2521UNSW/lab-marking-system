'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as React from 'react';
import type { Temporal } from 'temporal-polyfill';

dayjs.extend(relativeTime);

function TimeAgo({ date }: { date: Temporal.Instant }) {
	const [timeAgo, setTimeAgo] = React.useState(
		dayjs(date.epochMilliseconds).fromNow(),
	);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTimeAgo(dayjs(date.epochMilliseconds).fromNow());
		}, 60000);

		return () => clearInterval(interval);
	}, [date]);

	return timeAgo;
}

export { TimeAgo };
