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
	const link = getSubmissionLink(zid, activityCode);

	return link ? (
		<Text className="text-center">
			<Link
				target="_blank"
				href={link}
				className="text-muted-foreground outline-none focus:underline hover:underline"
			>
				View submission
				<ExternalLinkIcon className="inline ms-1 mb-0.5 size-4.5" />
			</Link>
		</Text>
	) : null;
}

export { SubmissionLink };
