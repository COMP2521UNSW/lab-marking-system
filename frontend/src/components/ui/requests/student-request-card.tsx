'use client';

import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { RequestStatus } from '@/components/ui/base/request-status';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export function StudentRequestCard({
	request,
	className,
	onWithdrawClick,
}: {
	request: MarkingRequestAsStudent;
	className?: string;
	onWithdrawClick?: () => void;
}) {
	return (
		<Card
			className={cn(
				'grid grid-cols-[1fr_1fr_1fr] items-center gap-4 p-2',
				className,
			)}
		>
			<Text className="wrap-anywhere">{request.activity.name}</Text>
			<Text className="text-center text-muted-foreground">
				<RequestStatus
					status={request.status}
					when={
						request.status === 'pending' ? request.createdAt : request.closedAt
					}
				/>
			</Text>
			<div className="flex justify-end">
				<Button
					variant="danger"
					className="px-2"
					disabled={request.status !== 'pending'}
					onClick={onWithdrawClick}
				>
					<Text>Withdraw</Text>
				</Button>
			</div>
		</Card>
	);
}
