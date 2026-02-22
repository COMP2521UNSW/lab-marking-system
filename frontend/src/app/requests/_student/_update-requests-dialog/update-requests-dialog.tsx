'use client';

import * as React from 'react';

import type { Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { MIN_WIDTH } from '@/app/layout';
import { ActivitySelect } from '@/components/ui/base/activity-select';
import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { ClassSelect } from '@/components/ui/requests/class-select';
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

import { useStudentRequests } from '../context';

export function UpdateRequestsDialog({
	open,
	setOpen,
	mode = 'create',
	attendedClass,
	currentRequests,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: 'create' | 'edit';
	attendedClass: Class | null;
	currentRequests: MarkingRequestAsStudent[];
}) {
	const { activeClasses, activeActivities } = useStudentRequests();

	const [selectedClass, setSelectedClass] = React.useState(attendedClass);

	const [selectedActivities, setSelectedActivities] = React.useState<string[]>(
		[],
	);

	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			setSelectedClass(attendedClass);
			setSelectedActivities([]);
			setLoading(false);
		}
	}, [open, attendedClass]);

	const canSubmit =
		(mode === 'create' &&
			selectedClass !== null &&
			selectedActivities.length > 0) ||
		(mode === 'edit' &&
			selectedClass?.code !== undefined &&
			(selectedClass?.code !== attendedClass?.code ||
				selectedActivities.length > 0));

	const handleConfirmClick = async () => {
		if (!canSubmit) return;

		setLoading(true);

		try {
			await requestsService.updateRequests({
				classCode: selectedClass.code,
				activityCodes: selectedActivities,
			});

			if (mode === 'create') {
				toast('Request created');
			} else {
				toast('Request edited');
			}
			setOpen(false);
		} catch (err) {
			if (err instanceof ApiError) {
				toast(err.message);
			} else {
				toast('Something went wrong, please try again');
			}

			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				showCloseButton={false}
				className="w-[calc(100%-32px)] max-w-96! bg-card shadow-regular"
				style={{ minWidth: `${MIN_WIDTH - 32}px` }}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-light text-primary">
						{mode === 'create' ? 'Create' : 'Edit'} Request
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="flex flex-col items-center gap-4 w-full">
						<Text className="text-center">
							Which lab class are you currently attending?
						</Text>

						<ClassSelect
							className="w-full max-w-84"
							classes={activeClasses}
							value={selectedClass ?? undefined}
							onValueChange={(cls) => {
								setSelectedClass(cls);
							}}
						/>
					</div>

					<div className="flex flex-col items-center gap-4 w-full">
						<div className="space-y-2">
							<Text className="text-center">
								Which activities would you like to get marked?
							</Text>
							<Text className="text-center text-muted-foreground">
								To cancel a request, you must go back to the list of requests
								and withdraw it.
							</Text>
						</div>
						<ActivitySelect
							className="w-full max-w-84"
							options={activeActivities.map((activeActivity) => ({
								value: activeActivity.activity.code,
								label: activeActivity.activity.name,
								marked: activeActivity.marked,
							}))}
							preselected={currentRequests
								.filter((req) => req.status === 'pending')
								.map((req) => req.activity.code)}
							onChange={(ids) => setSelectedActivities(ids)}
						/>
					</div>

					<div className="flex gap-4 w-full max-w-84">
						<Button
							className="flex-1"
							disabled={!canSubmit || loading}
							loading={loading}
							onClick={handleConfirmClick}
						>
							<Text>{mode === 'create' ? 'Request' : 'Confirm Edit'}</Text>
						</Button>
						<Button
							variant="danger"
							className="flex-1"
							onClick={() => setOpen(false)}
						>
							<Text>{mode === 'create' ? 'Cancel' : 'Cancel Edit'}</Text>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
