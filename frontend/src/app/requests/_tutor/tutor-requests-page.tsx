'use client';

import { Helmet } from '@dr.pogodin/react-helmet';
import * as React from 'react';

import type { ActiveClasses, Class } from '@workspace/types/classes';
import type { StudentWithRequests } from '@workspace/types/requests';

import {
	ActiveClassesProvider,
	useActiveClasses,
} from '@/components/providers/active-classes-provider';
import { TutorSocketProvider } from '@/components/providers/socket-provider';
import { Card } from '@/components/ui/base/card';
import { Image } from '@/components/ui/base/image';
import { Loading } from '@/components/ui/base/loading';
import { Spinner } from '@/components/ui/base/spinner';
import { toast } from '@/components/ui/base/toast';
import { Toggle } from '@/components/ui/base/toggle';
import { Text } from '@/components/ui/base/typography';
import { ClassSelect } from '@/components/ui/requests/class-select';
import { TutorRequestCard } from '@/components/ui/requests/tutor-request-card';
import { ApiError } from '@/lib/errors';
import * as classesService from '@/services/classes';

import { AmendDialogProvider, useAmendDialog } from './_amend-dialog/context';
import {
	DeclineDialogProvider,
	useDeclineDialog,
} from './_decline-dialog/context';
import { MarkDialogProvider, useMarkDialog } from './_mark-dialog/context';
import { useRequestManager } from './request-manager';

type LoadingState =
	| {
			loaded: false;
	  }
	| {
			loaded: true;
			data: {
				activeClasses: ActiveClasses;
			};
	  };

export function TutorRequestsPage() {
	const [loadingState, setLoadingState] = React.useState<LoadingState>({
		loaded: false,
	});

	React.useEffect(() => {
		async function fetchData() {
			try {
				const activeClasses = await classesService.getActiveClasses();

				setLoadingState({
					loaded: true,
					data: { activeClasses },
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
			<Helmet title="Marking Requests" />

			{!loadingState.loaded ? (
				<Loading />
			) : (
				<TutorSocketProvider>
					<ActiveClassesProvider
						initialActiveClasses={loadingState.data.activeClasses}
					>
						<DeclineDialogProvider>
							<MarkDialogProvider>
								<AmendDialogProvider>
									<TutorRequests />
								</AmendDialogProvider>
							</MarkDialogProvider>
						</DeclineDialogProvider>
					</ActiveClassesProvider>
				</TutorSocketProvider>
			)}
		</>
	);
}

function TutorRequests() {
	const { activeClasses } = useActiveClasses();
	const { openRequests, closedRequests, changeClass } = useRequestManager();

	const [selectedClass, setSelectedClass] = React.useState<Class>();

	const [loading, setLoading] = React.useState(false);

	const handleClassChange = async (cls: Class) => {
		setSelectedClass(cls);

		setLoading(true);
		await changeClass(cls);
		setLoading(false);
	};

	return (
		<Card className="flex flex-col items-center gap-6 min-h-full py-6 px-4">
			<div className="flex flex-col items-center gap-4 w-full">
				<Text>Select a class to view requests</Text>

				<ClassSelect
					classes={activeClasses}
					selectedClass={selectedClass}
					className="w-full max-w-84"
					onValueChange={handleClassChange}
				/>
			</div>

			{selectedClass &&
				(loading ? (
					<Spinner className="size-12" />
				) : (
					<Requests
						openRequests={openRequests}
						closedRequests={closedRequests}
					/>
				))}
		</Card>
	);
}

function Requests({
	openRequests,
	closedRequests,
}: {
	openRequests: StudentWithRequests[];
	closedRequests: StudentWithRequests[];
}) {
	const [tab, setTab] = React.useState<'open' | 'closed'>('open');

	return (
		<div className="flex flex-col items-center w-full space-y-4">
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
				onValueChange={setTab as (open: string) => void}
			/>

			<RequestList
				key={tab}
				mode={tab}
				students={tab === 'open' ? openRequests : closedRequests}
			/>
		</div>
	);
}

function RequestList({
	mode,
	students,
}: {
	mode: 'open' | 'closed';
	students: StudentWithRequests[];
}) {
	const { mark } = useMarkDialog();
	const { decline } = useDeclineDialog();
	const { amend } = useAmendDialog();

	if (students.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4">
				<Text>No {mode} requests</Text>
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

	return (
		<div className="w-full space-y-4">
			{students.map((stu) => (
				<TutorRequestCard
					key={stu.student.zid}
					className="w-full"
					student={stu.student}
					requests={stu.requests}
					onMarkClick={(request) => mark(stu.student, request)}
					onDeclineClick={(request) => decline(stu.student, request)}
					onAmendClick={(request) => amend(stu.student, request)}
				/>
			))}
		</div>
	);
}
