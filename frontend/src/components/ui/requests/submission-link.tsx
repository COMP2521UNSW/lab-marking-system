import { ExternalLinkIcon } from 'lucide-react';

import { getSubmissionLink } from '@workspace/config';

import { Link } from '@/components/ui/base/link';
import { Text } from '@/components/ui/base/typography';

function SubmissionLink({
	zid,
	activityCode,
}: {
	zid: string;
	activityCode: string;
}) {
	return (
		<Text className="text-center">
			<Link
				target="_blank"
				href={getSubmissionLink(zid, activityCode)}
				className="text-muted-foreground outline-none focus:underline hover:underline"
			>
				View submission
				<ExternalLinkIcon className="inline ms-1 mb-0.5 size-4.5" />
			</Link>
		</Text>
	);
}

export { SubmissionLink };
