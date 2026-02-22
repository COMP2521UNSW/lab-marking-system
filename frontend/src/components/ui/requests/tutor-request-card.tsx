'use client';

import * as React from 'react';

import type {
	MarkedRequest,
	MarkingRequestAsTutor,
} from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import { RequestStatus } from '@/components/ui/base/request-status';
import { Separator } from '@/components/ui/base/separator';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export function TutorRequestCard({
	student,
	requests,
	className,
	onMarkClick,
	onDeclineClick,
	onAmendClick,
}: {
	student: Student;
	requests: MarkingRequestAsTutor[];
	className?: string;
	onMarkClick: (request: MarkingRequestAsTutor) => void;
	onDeclineClick: (request: MarkingRequestAsTutor) => void;
	onAmendClick: (request: MarkedRequest) => void;
}) {
	const handleAmendClick = (request: MarkingRequestAsTutor) => {
		if (request.status === 'marked') {
			onAmendClick(request);
		}
	};

	return (
		<div
			className={cn(
				'w-full min-w-fit rounded-strong border border-outline shadow-regular bg-card',
				className,
			)}
		>
			<div className="flex justify-between p-2">
				<Text>{student.name}</Text>
				<Text>{student.zid}</Text>
			</div>

			<Separator />

			<div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-x-4 gap-y-2 p-2">
				{requests.map((request) => (
					<React.Fragment key={request.id}>
						<Text className="wrap-anywhere">{request.activity.name}</Text>

						<Text className="text-center text-muted-foreground leading-4.5">
							<RequestStatus
								status={request.status}
								when={
									request.status === 'pending'
										? request.createdAt
										: request.closedAt
								}
							/>
						</Text>

						<div className="flex flex-col xs:flex-row gap-2 justify-self-end whitespace-nowrap">
							{request.closedAt === null ? (
								<React.Fragment>
									<Button
										variant="primary"
										className="px-2 h-8 xs:h-9"
										disabled={request.status !== 'pending'}
										onClick={() => onMarkClick(request)}
									>
										<Text>Mark</Text>
									</Button>
									<Button
										variant="danger"
										className="px-2 h-8 xs:h-9"
										disabled={request.status !== 'pending'}
										onClick={() => onDeclineClick(request)}
									>
										<Text>Decline</Text>
									</Button>
								</React.Fragment>
							) : (
								<Button
									variant="primary"
									className="px-2"
									disabled={request.status !== 'marked'}
									onClick={() => handleAmendClick(request)}
								>
									<Text>Amend</Text>
								</Button>
							)}
						</div>
					</React.Fragment>
				))}
			</div>
		</div>
	);
}
