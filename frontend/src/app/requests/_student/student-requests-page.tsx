'use client';

import { Helmet } from '@dr.pogodin/react-helmet';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';

import type { ActivityWithStatus } from '@workspace/types/activities';
import type { ActiveClasses, Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

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
import { StudentRequestsProvider, useStudentRequests } from './context';

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
				const { activeClasses, activeActivities, requestDetails } =
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
				<DeclinedDialogProvider>
					<StudentRequestsProvider {...loadingState.data}>
						<UpdateRequestsDialogProvider>
							<WithdrawDialogProvider>
								<StudentRequests />
							</WithdrawDialogProvider>
						</UpdateRequestsDialogProvider>
					</StudentRequestsProvider>
				</DeclinedDialogProvider>
			)}
		</>
	);
}

function StudentRequests() {
	const { requests } = useStudentRequests();

	return (
		<Card className="py-6 px-4 space-y-6">
			{requests.length === 0 ? <NoRequests /> : <Requests />}
		</Card>
	);
}

function NoRequests() {
	const { attendedClass, requests } = useStudentRequests();

	const { updateRequests } = useUpdateRequestsDialog();

	return (
		<div className="flex flex-col items-center gap-4">
			<Text className="text-center">
				You don&rsquo;t have any open marking requests.
			</Text>
			<Button onClick={() => updateRequests('create', attendedClass, requests)}>
				<Text>Request Marking</Text>
			</Button>
			<Image
				src="/sleeping.gif"
				alt="Sleeping"
				height={0}
				width={0}
				loading="eager"
				className="w-42 rounded-strong"
			/>
		</div>
	);
}

function Requests() {
	const { activeClasses, attendedClass, requests } = useStudentRequests();

	const { updateRequests } = useUpdateRequestsDialog();
	const { withdraw } = useWithdrawDialog();

	const numPendingRequests = requests.filter(
		(req) => req.status === 'pending',
	).length;

	return (
		<div className="flex flex-col items-center gap-4">
			{numPendingRequests === 0 ? (
				<>
					<Text>All of your requests have been marked!</Text>

					<Button
						onClick={() => updateRequests('create', attendedClass, requests)}
					>
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

							<SelectedClassAdvice
								activeClasses={activeClasses}
								attendedClass={attendedClass}
							/>
						</div>

						<Button
							onClick={() => updateRequests('edit', attendedClass, requests)}
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
	activeClasses,
	attendedClass,
}: {
	activeClasses: ActiveClasses;
	attendedClass: Class | null;
}) {
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
