'use client';

import { Helmet } from '@dr.pogodin/react-helmet';
import { format } from 'date-fns';
import { ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import type { ManualRequest } from '@workspace/types/requests';

import { LoginRequired } from '@/components/guards/login-required';
import { AdminRequired } from '@/components/guards/role-required';
import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { Image, preloadImage } from '@/components/ui/base/image';
import { Loading } from '@/components/ui/base/loading';
import { ScrollArea, ScrollBar } from '@/components/ui/base/scroll-area';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/base/table';
import { toast } from '@/components/ui/base/toast';
import { Toggle } from '@/components/ui/base/toggle';
import { Text } from '@/components/ui/base/typography';
import { ApiError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import * as requestsService from '@/services/requests';

import { DenyDialogProvider, useDenyDialog } from './_deny-dialog/context';

type LoadingState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			data: {
				requests: ManualRequest[];
			};
	  };

export default function Page() {
	preloadImage('/sleeping-fish.png');

	return (
		<>
			<LoginRequired>
				<AdminRequired>
					<Helmet title="Mark Approvals" />

					<MarkApprovalsPage />
				</AdminRequired>
			</LoginRequired>
		</>
	);
}

function MarkApprovalsPage() {
	const [loadingState, setLoadingState] = React.useState<LoadingState>({
		loaded: false,
	});

	React.useEffect(() => {
		async function fetchData() {
			try {
				const requests = await requestsService.getAllManualRequests();

				setLoadingState({
					loaded: true,
					data: { requests },
				});
			} catch (err) {
				if (err instanceof ApiError) {
					toast(err.message);
				} else {
					toast('Something went wrong, please try again');
				}
			}
		}

		fetchData();
	}, []);

	if (!loadingState.loaded) {
		return <Loading />;
	}

	const data = loadingState.data;
	return (
		<DenyDialogProvider>
			<MarkApprovals requests={data.requests} />
		</DenyDialogProvider>
	);
}

function MarkApprovals({
	requests: initialRequests,
}: {
	requests: ManualRequest[];
}) {
	const [requests, setRequests] = React.useState(() => {
		const groupedRequests = Object.groupBy(initialRequests, (request) =>
			request.status === 'pending' ? 'open' : 'closed',
		);
		return {
			open: groupedRequests.open ?? [],
			closed: groupedRequests.closed ?? [],
		};
	});

	const [tab, setTab] = React.useState('open');

	const closeRequest = (updatedRequest: ManualRequest) => {
		setRequests((requests) => {
			const index = requests.open.findIndex(
				(request) => request.id === updatedRequest.id,
			);
			if (index === -1) {
				return requests;
			}

			return {
				open: requests.open.toSpliced(index, 1),
				closed: requests.closed.concat(updatedRequest),
			};
		});
	};

	return (
		<Card className="min-h-full py-6 px-4">
			<div className="flex flex-col items-center gap-4">
				<Text>Approve manual requests</Text>

				<Toggle
					options={[
						{
							value: 'open',
							label: `Open requests`,
						},
						{
							value: 'closed',
							label: `Closed requests`,
						},
					]}
					defaultValue="open"
					onValueChange={setTab}
				/>
			</div>

			<div className="h-4" />

			<div className={cn(tab === 'open' ? 'block' : 'hidden')}>
				<RequestList
					mode="open"
					requests={requests.open}
					closeRequest={closeRequest}
				/>
			</div>

			<div className={cn(tab === 'closed' ? 'block' : 'hidden')}>
				<RequestList
					mode="closed"
					requests={requests.closed}
					closeRequest={closeRequest}
				/>
			</div>
		</Card>
	);
}

function RequestList({
	mode,
	requests,
	closeRequest,
}: {
	mode: 'open' | 'closed';
	requests: ManualRequest[];
	closeRequest: (updatedRequest: ManualRequest) => void;
}) {
	if (requests.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4">
				<Text>No {mode} requests</Text>

				<Image
					src="/sleeping-fish.png"
					alt="Sleeping"
					height={240}
					width={240}
					className="w-48 rounded-strong"
				/>
			</div>
		);
	}

	return (
		// TODO: stop hardcoding widths
		<div className="rounded-strong border w-[calc(100vw-66px)] min-w-[294px] max-w-[calc(896px-66px)] overflow-x-auto">
			<ScrollArea>
				<Table>
					<TableHeader className="font-semibold">
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead className="text-center">Activity</TableHead>
							{mode === 'closed' && (
								<TableHead className="text-center">Status</TableHead>
							)}
							<TableHead className="w-8">
								<ChevronRightIcon />
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{requests.map((request) => (
							<RequestRow
								key={request.id}
								mode={mode}
								request={request}
								closeRequest={closeRequest}
							/>
						))}
					</TableBody>
				</Table>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

function RequestRow({
	mode,
	request,
	closeRequest,
}: {
	mode: 'open' | 'closed';
	request: ManualRequest;
	closeRequest: (request: ManualRequest) => void;
}) {
	const { deny } = useDenyDialog();

	const [expanded, setExpanded] = React.useState(false);

	const [loading, setLoading] = React.useState(false);

	const handleApproveClick = async () => {
		setLoading(true);

		try {
			const updatedRequest = await requestsService.approveManualRequest({
				id: request.id,
			});

			closeRequest(updatedRequest);
			toast('Request approved');
		} catch (err) {
			if (err instanceof ApiError) {
				toast(err.message);
			} else {
				toast('Something went wrong, please try again');
			}
		}

		setLoading(false);
	};

	const handleDenyClick = () => {
		const onConfirmed = async (reason: string) => {
			try {
				const updatedRequest = await requestsService.denyManualRequest({
					id: request.id,
					reason,
				});

				toast('Manual request denied');
				closeRequest(updatedRequest);
			} catch (err) {
				if (err instanceof ApiError) {
					toast(err.message);
				} else {
					toast('Something went wrong, please try again');
				}

				throw err;
			}
		};

		deny(onConfirmed);
	};

	return (
		<>
			<TableRow
				className={cn(expanded && 'bg-muted')}
				onClick={() => setExpanded((expanded) => !expanded)}
			>
				<TableCell>
					<Text className="inline" onClick={(e) => e.stopPropagation()}>
						{request.student.name} ({request.student.zid})
					</Text>
				</TableCell>
				<TableCell className="text-center">
					<Text className="inline" onClick={(e) => e.stopPropagation()}>
						{request.activity.name}
					</Text>
				</TableCell>
				{mode === 'closed' && (
					<TableCell className="text-center">
						<Text className="inline" onClick={(e) => e.stopPropagation()}>
							{request.status}
						</Text>
					</TableCell>
				)}
				<TableCell className="flex items-center">
					<button className="rounded-full focus-ring cursor-pointer">
						<ChevronRightIcon
							className={cn(
								'transition-all',
								expanded ? 'rotate-90' : 'rotate-0',
							)}
						/>
					</button>
				</TableCell>
			</TableRow>

			{expanded && (
				<TableRow>
					<TableCell colSpan={3} className="space-y-2">
						<div className="space-y-1">
							<Text>
								<span className="font-semibold">Requested by:</span>{' '}
								{request.markerName}
							</Text>
							<Text>
								<span className="font-semibold">Mark:</span> {request.mark}/
								{request.activity.maxMark}
							</Text>
							<Text className="text-wrap">
								<span className="font-semibold">Reason:</span> {request.reason}
							</Text>
							<Text className="text-wrap">
								<span className="font-semibold">Date requested:</span>{' '}
								{format(new Date(request.markedAt), 'EEEE do MMMM h:mmaaa')}
							</Text>
							{request.status !== 'pending' && (
								<>
									<Text>
										<span className="font-semibold">Status:</span>{' '}
										{request.status === 'approved' ? 'Approved' : 'Denied'} by{' '}
										{request.approverName}
									</Text>
									{request.status === 'denied' && (
										<Text>
											<span className="font-semibold">Deny reason:</span>{' '}
											{request.denyReason}
										</Text>
									)}
								</>
							)}
						</div>

						{request.status === 'pending' && (
							<div className="flex justify-end gap-2">
								<Button
									size="sm"
									variant="primary"
									loading={loading}
									disabled={loading}
									onClick={handleApproveClick}
								>
									<Text>Approve</Text>
								</Button>
								<Button
									size="sm"
									variant="danger"
									disabled={loading}
									onClick={handleDenyClick}
								>
									<Text>Deny</Text>
								</Button>
							</div>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
