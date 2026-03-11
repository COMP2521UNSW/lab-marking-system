'use client';

import { Helmet } from '@dr.pogodin/react-helmet';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';

import type { ActivityWithStatus } from '@workspace/types/activities';
import type { ActiveClasses, Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import {
	ActiveClassesProvider,
	useActiveClasses,
} from '@/components/providers/active-classes-provider';
import {
	StudentSocketProvider,
	useStudentSocket,
} from '@/components/providers/sockets/student-socket-provider';
import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { Image } from '@/components/ui/base/image';
import { Loading } from '@/components/ui/base/loading';
import { toast } from '@/components/ui/base/toast';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/base/tooltip';
import { Text } from '@/components/ui/base/typography';
import { StudentRequestCard } from '@/components/ui/requests/student-request-card';
import { ApiError } from '@/lib/errors';
import * as pagesService from '@/services/pages';

import { DeclinedDialogProvider } from './_declined-dialog/context';
import {
	UpdateRequestsDialogProvider,
	useUpdateRequestsDialog,
} from './_update-requests-dialog/context';
import {
	useWithdrawDialog,
	WithdrawDialogProvider,
} from './_withdraw-dialog/context';
import { useRequestManager } from './request-manager';

type LoadingState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			data: {
				attendedClass: Class | null;
				requests: MarkingRequestAsStudent[];
				activeClasses: ActiveClasses;
				activeActivities: ActivityWithStatus[];
			};
	  };

export function StudentRequestsPage() {
	const [loadingState, setLoadingState] = React.useState<LoadingState>({
		loaded: false,
	});

	React.useEffect(() => {
		async function fetchData() {
			try {
				const { requestDetails, activeClasses, activeActivities } =
					await pagesService.getStudentRequestsPage();

				setLoadingState({
					loaded: true,
					data: {
						attendedClass: requestDetails.class,
						requests: requestDetails.requests,
						activeClasses,
						activeActivities: activeActivities,
					},
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

	return (
		<>
			<Helmet title="Request Marking" />

			{!loadingState.loaded ? (
				<Loading />
			) : (
				<StudentSocketProvider>
					<ActiveClassesProvider
						useSocket={useStudentSocket}
						initialActiveClasses={loadingState.data.activeClasses}
					>
						<UpdateRequestsDialogProvider>
							<WithdrawDialogProvider>
								<DeclinedDialogProvider>
									<StudentRequests {...loadingState.data} />
								</DeclinedDialogProvider>
							</WithdrawDialogProvider>
						</UpdateRequestsDialogProvider>
					</ActiveClassesProvider>
				</StudentSocketProvider>
			)}
		</>
	);
}

function StudentRequests({
	attendedClass: initialAttendedClass,
	requests: initialRequests,
	activeActivities: initialActiveActivities,
}: {
	attendedClass: Class | null;
	requests: MarkingRequestAsStudent[];
	activeActivities: ActivityWithStatus[];
}) {
	const { attendedClass, requests, activeActivities } = useRequestManager(
		initialAttendedClass,
		initialRequests,
		initialActiveActivities,
	);

	return (
		<Card className="min-h-full py-6 px-4 space-y-6">
			{requests.length === 0 ? (
				<NoRequests
					attendedClass={attendedClass}
					activeActivities={activeActivities}
				/>
			) : (
				<Requests
					attendedClass={attendedClass}
					requests={requests}
					activeActivities={activeActivities}
				/>
			)}
		</Card>
	);
}

function NoRequests({
	attendedClass,
	activeActivities,
}: {
	attendedClass: Class | null;
	activeActivities: ActivityWithStatus[];
}) {
	const { updateRequests } = useUpdateRequestsDialog();

	return (
		<div className="flex flex-col items-center gap-4">
			<Text className="text-center">
				You don&rsquo;t have any open marking requests.
			</Text>

			<Button
				onClick={() =>
					updateRequests('create', attendedClass, [], activeActivities)
				}
			>
				<Text>Request Marking</Text>
			</Button>

			<Image
				src="/sleeping.gif"
				alt=""
				height={0}
				width={0}
				loading="eager"
				unoptimized
				className="w-42 rounded-strong"
			/>
		</div>
	);
}

function Requests({
	attendedClass,
	requests,
	activeActivities,
}: {
	attendedClass: Class | null;
	requests: MarkingRequestAsStudent[];
	activeActivities: ActivityWithStatus[];
}) {
	const { updateRequests } = useUpdateRequestsDialog();
	const { withdraw } = useWithdrawDialog();

	const pendingRequests = requests.filter(
		(request) => request.status === 'pending',
	);
	const numPendingRequests = pendingRequests.length;

	const doUpdateRequests = (mode: 'create' | 'edit') => {
		updateRequests(mode, attendedClass, pendingRequests, activeActivities);
	};

	return (
		<div className="flex flex-col items-center gap-4">
			{numPendingRequests === 0 ? (
				<>
					<Text className="text-center">
						All of your requests have been marked!
					</Text>

					<Button onClick={() => doUpdateRequests('create')}>
						<Text>Request Marking</Text>
					</Button>
				</>
			) : (
				<>
					<Text className="text-center">
						Your marking request{numPendingRequests > 1 && 's'}{' '}
						{numPendingRequests > 1 ? 'are' : 'is'} pending!
					</Text>
					<Text className="text-center">
						Please wait for a tutor to come by and mark you off.
					</Text>

					<div className="flex justify-between items-center gap-2 w-full">
						<div className="flex items-center gap-2">
							<Text>
								<b>Class:</b>{' '}
								{attendedClass === null
									? 'None selected'
									: `${attendedClass.code} (${attendedClass.labLocation})`}
							</Text>

							<SelectedClassAdvice attendedClass={attendedClass} />
						</div>

						<Button
							aria-label="Edit requests"
							onClick={() => doUpdateRequests('edit')}
						>
							<Text>Edit</Text>
						</Button>
					</div>
				</>
			)}

			<div className="w-full space-y-4">
				{requests.map((request) => (
					<StudentRequestCard
						key={request.id}
						request={request}
						onWithdrawClick={() => withdraw(request)}
					/>
				))}
			</div>
		</div>
	);
}

function SelectedClassAdvice({
	attendedClass,
}: {
	attendedClass: Class | null;
}) {
	const { activeClasses } = useActiveClasses();

	if (attendedClass === null) {
		return null;
	}

	if (
		activeClasses.upcoming.find(
			(activeClass) => activeClass.code === attendedClass.code,
		)
	) {
		return (
			<Tooltip>
				<TooltipTrigger>
					<InfoIcon className="size-5" />
				</TooltipTrigger>
				<TooltipContent className="text-center">
					This lab class is starting soon,
					<br />
					please wait for the class to begin.
				</TooltipContent>
			</Tooltip>
		);
	}

	if (
		!activeClasses.current.find(
			(activeClass) => activeClass.code === attendedClass.code,
		)
	) {
		return (
			<Tooltip>
				<TooltipTrigger>
					<TriangleAlertIcon className="size-5" />
				</TooltipTrigger>
				<TooltipContent className="text-center">
					This class is not currently running,
					<br />
					please select another class.
				</TooltipContent>
			</Tooltip>
		);
	}
}
