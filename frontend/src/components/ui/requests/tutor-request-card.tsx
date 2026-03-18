'use client';

import * as React from 'react';

import type {
	DeclinedRequest,
	MarkedRequest,
	MarkingRequestAsTutor,
	WithdrawnRequest,
} from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/base/button';
import { Separator } from '@/components/ui/base/separator';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { TutorRequestStatus } from '@/components/ui/requests/request-status';
import { ApiError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import * as requestsService from '@/services/requests';

export function TutorRequestCard({
	student,
	requests,
	className,
	onDeclineClick,
	onMarkClick,
	onAmendClick,
	onViewClick,
}: {
	student: Student;
	requests: MarkingRequestAsTutor[];
	className?: string;
	onDeclineClick: (request: MarkingRequestAsTutor) => void;
	onMarkClick: (request: MarkingRequestAsTutor) => void;
	onAmendClick: (request: MarkedRequest) => void;
	onViewClick: (request: WithdrawnRequest | DeclinedRequest) => void;
}) {
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
					<RequestRow
						key={request.id}
						request={request}
						onDeclineClick={onDeclineClick}
						onMarkClick={onMarkClick}
						onAmendClick={onAmendClick}
						onViewClick={onViewClick}
					/>
				))}
			</div>
		</div>
	);
}

function RequestRow({
	request,
	onDeclineClick,
	onMarkClick,
	onAmendClick,
	onViewClick,
}: {
	request: MarkingRequestAsTutor;
	onDeclineClick: (request: MarkingRequestAsTutor) => void;
	onMarkClick: (request: MarkingRequestAsTutor) => void;
	onAmendClick: (request: MarkedRequest) => void;
	onViewClick: (request: WithdrawnRequest | DeclinedRequest) => void;
}) {
	const { user } = useAuth();

	const claimedBySelf =
		request.status === 'pending' && request.claimer?.zid === user?.zid;

	const [loading, setLoading] = React.useState(false);

	const handleClaimClick = async () => {
		if (request.status !== 'pending') return;

		setLoading(true);
		try {
			if (!claimedBySelf) {
				await requestsService.claimRequest({ id: request.id });
			} else {
				await requestsService.unclaimRequest({ id: request.id });
			}
		} catch (err) {
			toast(
				err instanceof ApiError
					? err.message
					: 'Something went wrong, please try again',
			);
		}
		setLoading(false);
	};

	const handleAmendClick = () => {
		if (request.status === 'marked') {
			onAmendClick(request);
		}
	};

	const handleViewClick = () => {
		if (request.status === 'withdrawn' || request.status === 'declined') {
			onViewClick(request);
		}
	};

	return (
		<>
			<Text className="wrap-anywhere">{request.activity.name}</Text>

			<Text className="text-center text-muted-foreground leading-4.5">
				<TutorRequestStatus request={request} claimedBySelf={claimedBySelf} />
			</Text>

			{request.closedAt === null ? (
				<div className="flex flex-col xxs:flex-row xxs:flex-wrap xs:flex-nowrap gap-2 items-end xxs:justify-center xs:justify-self-end xxs:w-38 xs:w-auto  whitespace-nowrap">
					<Button
						variant="outline"
						className="px-2 h-8 w-18"
						disabled={request.status !== 'pending'}
						loading={loading}
						aria-label={`${!claimedBySelf ? 'Claim' : 'Unclaim'} ${request.activity.name}`}
						onClick={handleClaimClick}
					>
						<Text>{!claimedBySelf ? 'Claim' : 'Unclaim'}</Text>
					</Button>
					<Button
						variant="primary"
						className="px-2 h-8 w-18"
						aria-label={`Mark ${request.activity.name}`}
						onClick={() => onMarkClick(request)}
					>
						<Text>Mark</Text>
					</Button>
					<Button
						variant="danger"
						className="px-2 h-8 w-18"
						aria-label={`Decline ${request.activity.name}`}
						onClick={() => onDeclineClick(request)}
					>
						<Text>Decline</Text>
					</Button>
				</div>
			) : (
				<div className="flex justify-end">
					{request.status === 'marked' ? (
						<Button
							variant="primary"
							size="sm"
							className="w-16 px-2"
							aria-label={`Amend ${request.activity.name} mark`}
							onClick={handleAmendClick}
						>
							<Text>Amend</Text>
						</Button>
					) : (
						<Button
							variant="primary"
							size="sm"
							className="w-16 px-2"
							aria-label={`View ${request.activity.name} request`}
							onClick={handleViewClick}
						>
							<Text>View</Text>
						</Button>
					)}
				</div>
			)}
		</>
	);
}
