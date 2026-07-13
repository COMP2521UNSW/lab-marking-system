'use client';

import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import * as React from 'react';

import type { Class } from '@workspace/types/classes';
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
import { errorToast } from '@/components/ui/base/toast';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/base/tooltip-v2';
import { Text } from '@/components/ui/base/typography';
import { TutorRequestStatus } from '@/components/ui/requests/request-status';
import { cn } from '@/lib/utils';
import requestsService from '@/services/requests';

import { useConfirmClaimDialog } from './confirm-claim-dialog/context';

export function TutorRequestCard({
	currClass,
	student,
	requests,
	className,
	onDeclineClick,
	onMarkClick,
	onAmendClick,
	onViewClick,
}: {
	currClass: Class;
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
				<div className="flex gap-2">
					<Text>{student.name}</Text>
					<MembershipIcon currClass={currClass} student={student} />
				</div>
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

function MembershipIcon({
	currClass,
	student,
}: {
	currClass: Class;
	student: Student;
}) {
	const isClassMember = student.classCode === currClass.code;

	return (
		<Tooltip>
			<TooltipTrigger className="rounded-full outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
				{isClassMember ? (
					<MemberIcon />
				) : (
					<CheckBadgeIcon
						className="size-5 fill-muted-foreground/40"
						viewBox="1 1 22 22"
					/>
				)}
			</TooltipTrigger>
			<TooltipContent>
				{isClassMember
					? 'Enrolled in this class'
					: student.classCode === null
						? 'Not enrolled in any classes'
						: `Enrolled in ${student.classCode}`}
			</TooltipContent>
		</Tooltip>
	);
}

function MemberIcon() {
	return (
		<div className="relative">
			<div className="absolute top-0 left-0 size-full rounded-full p-1 bg-white bg-clip-content" />
			<CheckBadgeIcon
				className="relative size-5 fill-primary"
				viewBox="1 1 22 22"
			/>
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
	const { confirmClaim } = useConfirmClaimDialog();

	const claimedBySelf =
		request.status === 'pending' && request.claimer?.zid === user?.zid;

	const [loading, setLoading] = React.useState(false);

	const handleClaimClick = async () => {
		if (request.status !== 'pending') return;

		if (request.claimer !== null && request.claimer.zid !== user?.zid) {
			const firstName = request.claimer.name.split(' ')[0];
			if (!(await confirmClaim(firstName))) {
				return;
			}
		}

		setLoading(true);
		try {
			if (!claimedBySelf) {
				await requestsService.claimRequest({ id: request.id });
			} else {
				await requestsService.unclaimRequest({ id: request.id });
			}
		} catch (err) {
			errorToast(err);
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

			{request.status === 'pending' ? (
				<div className="flex flex-col xxs:flex-row xxs:flex-wrap xs:flex-nowrap gap-2 items-end xxs:justify-center xs:justify-self-end xxs:w-38 xs:w-auto whitespace-nowrap">
					<Button
						variant="outline"
						className="px-2 h-8 w-18"
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
