'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as React from 'react';

dayjs.extend(relativeTime);

function TimeAgo({ date }: { date: Date }) {
	const [timeAgo, setTimeAgo] = React.useState(dayjs(date).fromNow());

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTimeAgo(dayjs(date).fromNow());
		}, 60000);

		return () => clearInterval(interval);
	}, [date]);

	return timeAgo;
}

export { TimeAgo };
