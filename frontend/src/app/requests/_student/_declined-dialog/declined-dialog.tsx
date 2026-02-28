'use client';

import * as React from 'react';

import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Text } from '@/components/ui/base/typography';

export function DeclinedDialog({
	request,
	reason,
	onClose,
}: {
	request: MarkingRequestAsStudent;
	reason: string;
	onClose: () => void;
}) {
	const [open, setOpen] = React.useState(true);

	const handleClose = () => {
		setOpen(false);
		onClose();
	};

	return (
		<Dialog open={open}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">Marking Request Declined</DialogTitle>
				</DialogHeader>

				<Text>
					Your marking request for {request.activity.name} was declined.
				</Text>

				<Text className="italic">
					<b>Reason:</b> {reason}
				</Text>

				<Text>
					Please create a new marking request with correct details once you are
					ready.
				</Text>

				<Button onClick={handleClose}>
					<Text>Close</Text>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
