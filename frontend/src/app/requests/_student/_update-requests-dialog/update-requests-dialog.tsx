'use client';

import * as React from 'react';

import { ActivityWithStatus } from '@workspace/types/activities';
import type { Class } from '@workspace/types/classes';
import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { useActiveClasses } from '@/components/providers/active-classes-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { ActivitySelect } from '@/components/ui/requests/activity-select';
import { ClassSelect } from '@/components/ui/requests/class-select';
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

export function UpdateRequestsDialog({
	open,
	setOpen,
	mode = 'create',
	attendedClass,
	pendingRequests,
	activeActivities,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: 'create' | 'edit';
	attendedClass: Class | null;
	pendingRequests: MarkingRequestAsStudent[];
	activeActivities: ActivityWithStatus[];
}) {
	const { user } = useAuth();

	const { activeClasses } = useActiveClasses();

	const [selectedClass, setSelectedClass] = React.useState(attendedClass);

	const [selectedActivities, setSelectedActivities] = React.useState<string[]>(
		[],
	);

	const [loading, setLoading] = React.useState(false);

	const enrolledClass = React.useMemo(
		() =>
			activeClasses.current.find((cls) => cls.code === user?.classCode) ||
			activeClasses.upcoming.find((cls) => cls.code === user?.classCode),
		[activeClasses, user?.classCode],
	);

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
				toast(`Request${selectedActivities.length > 1 ? 's' : ''} created`);
			} else {
				toast(
					`Request${pendingRequests.length + selectedActivities.length > 1 ? 's' : ''} edited`,
				);
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
			<DialogContent className="max-w-96" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">
						{mode === 'create' ? 'Create' : 'Edit'} Requests
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<div className="flex flex-col items-center gap-4 w-full">
						<div className="space-y-2">
							<Text id="class-desc-1" className="text-center">
								Which class are you currently attending?
							</Text>

							{enrolledClass && (
								<Text
									id="class-desc-2"
									className="text-center text-muted-foreground"
								>
									Your enrolled class: {enrolledClass.code} (
									{enrolledClass.labLocation})
								</Text>
							)}
						</div>

						<ClassSelect
							classes={activeClasses}
							selectedClass={selectedClass ?? undefined}
							className="w-full max-w-84"
							enrolledClassCode={user?.classCode}
							onValueChange={(cls) => {
								setSelectedClass(cls);
							}}
							aria-describedby="class-desc-1 class-desc-2"
						/>
					</div>

					<div className="flex flex-col items-center gap-4 w-full">
						<div className="space-y-2">
							<Text id="activities-desc-1" className="text-center">
								Which activities would you like to get marked?
							</Text>

							<Text
								id="activities-desc-2"
								className="text-center text-muted-foreground"
							>
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
							preselected={pendingRequests.map(
								(request) => request.activity.code,
							)}
							onValueChange={(ids) => setSelectedActivities(ids)}
							aria-describedby="activities-desc-1 activities-desc-2"
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
