'use client';

import type {
	DeclinedRequest,
	WithdrawnRequest,
} from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Text } from '@/components/ui/base/typography';

export function ViewDialog({
	open,
	setOpen,
	student,
	request,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	student: Student;
	request: WithdrawnRequest | DeclinedRequest;
}) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">
						Marking request for <span>{request.activity.name}</span> by{' '}
						{student.name} ({student.zid})
					</DialogTitle>
				</DialogHeader>

				{request.status === 'withdrawn' ? (
					<Text>
						This request was <b>withdrawn</b>.
					</Text>
				) : (
					<Text>
						This request was <b>declined</b> by <i>{request.tutorName}</i>.
					</Text>
				)}

				<Text className="italic">
					<b>Reason:</b> {request.reason}
				</Text>

				<Button onClick={() => setOpen(false)}>
					<Text>Close</Text>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
