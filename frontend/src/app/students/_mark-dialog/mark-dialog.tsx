'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

import type { ActivityAsTutor } from '@workspace/types/activities';
import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/base/field';
import { TextInput } from '@/components/ui/base/input';
import { Select } from '@/components/ui/base/select';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { MAX_REASON_LEN } from '@/lib/constants';
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

export function MarkDialog({
	open,
	setOpen,
	student,
	activities,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	student: Student;
	activities: ActivityAsTutor[];
}) {
	const [activity, setActivity] = React.useState<ActivityAsTutor | null>(null);

	const formSchema = React.useMemo(() => {
		return z.object({
			reason: z
				.string()
				.trim()
				.min(1, 'Reason is required')
				.max(
					MAX_REASON_LEN,
					`Reason must not exceed ${MAX_REASON_LEN} characters`,
				),
			activityCode: z.string(),
			mark: z
				.string()
				.trim()
				.min(1, 'Mark is required')
				.regex(/^-?(\.\d+|\d+(\.\d*)?)$/, 'Not a valid number')
				.refine(
					(value) => !/\.\d{3}/.test(value),
					'Max. 2 decimal places allowed',
				)
				.transform(Number)
				.refine(
					(value) => value >= 0 && value <= (activity?.maxMark ?? 0),
					`Mark must be between 0 and ${activity?.maxMark}`,
				),
		});
	}, [activity]);

	const form = useForm<
		z.input<typeof formSchema>,
		unknown,
		z.infer<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			reason: '',
			activityCode: '',
			mark: '',
		},
	});

	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			setActivity(null);
			form.reset();
			setLoading(false);
		}
	}, [form, open]);

	React.useEffect(() => {
		if (activity !== null && form.getFieldState('mark').isTouched) {
			form.trigger('mark');
		}
	}, [activity, form, formSchema]);

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);

		try {
			await requestsService.createManualRequest({
				studentZid: student.zid,
				activityCode: values.activityCode,
				reason: values.reason,
				mark: values.mark,
			});

			toast('Mark submitted for approval');
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
				className="w-[calc(100%-32px)] max-w-90! bg-card shadow-regular"
			>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-light text-primary">
						Manual marking request for {student.name} ({student.zid})
					</DialogTitle>

					<DialogDescription className="text-center">
						A manual marking request should only be made if it is too late for a
						student to request marking themselves.
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<FieldGroup className="gap-4">
						<Controller
							name="reason"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field className="gap-1.5" data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="reason">
										Reason for manual request
									</FieldLabel>
									<TextInput
										{...field}
										id="reason"
										aria-invalid={fieldState.invalid}
										maxLength={MAX_REASON_LEN}
										placeholder="e.g., special consideration"
									/>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
											className="text-xs"
										/>
									)}
								</Field>
							)}
						/>

						<Controller
							name="activityCode"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field className="gap-1.5" data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="activity">Activity</FieldLabel>
									<Select
										id="activity"
										options={activities.map((activity) => ({
											value: activity.code,
											label: activity.name,
										}))}
										value={field.value}
										className="w-full"
										placeholder="Select an activity..."
										onValueChange={(value) => {
											field.onChange(value);
											setActivity(
												activities.find((activity) => activity.code === value)!,
											);
										}}
									/>
								</Field>
							)}
						/>

						{activity !== null && (
							<Controller
								name="mark"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field className="gap-1.5" data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="mark">Mark</FieldLabel>
										<TextInput
											{...field}
											id="mark"
											aria-invalid={fieldState.invalid}
											placeholder={`Mark (out of ${activity?.maxMark})`}
										/>
										{fieldState.invalid && (
											<FieldError
												errors={[fieldState.error]}
												className="text-xs"
											/>
										)}
									</Field>
								)}
							/>
						)}
					</FieldGroup>

					<div className="flex gap-4">
						<Button
							type="submit"
							className="flex-1"
							disabled={!form.formState.isValid || loading}
							loading={loading}
						>
							<Text>Submit Mark</Text>
						</Button>
						<Button
							type="button"
							variant="danger"
							className="flex-1"
							onClick={() => setOpen(false)}
						>
							<Text>Cancel</Text>
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
