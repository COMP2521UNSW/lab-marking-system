'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

import type { MarkingRequestAsTutor } from '@workspace/types/requests';
import type { Student } from '@workspace/types/users';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Field, FieldError } from '@/components/ui/base/field';
import { TextInput } from '@/components/ui/base/input';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

export function MarkDialog({
	open,
	setOpen,
	student,
	request,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	student: Student;
	request: MarkingRequestAsTutor;
}) {
	console.log('MarkDialog');

	const formSchema = React.useMemo(
		() =>
			z.object({
				mark: z
					.string()
					.trim()
					.min(1, 'Mark is required')
					.regex(/^-?(\.\d+|\d+(\.\d*)?)$/, 'Not a valid number')
					.refine((value) => {
						const mark = Number(value);
						return mark >= 0 && mark <= request.activity.maxMark;
					}, `Mark must be between 0 and ${request.activity.maxMark}`)
					.refine(
						(value) => !/\.\d{3}/.test(value),
						'Max. 2 decimal places allowed',
					)
					.transform(Number),
			}),
		[request],
	);

	const form = useForm<
		z.input<typeof formSchema>,
		unknown,
		z.infer<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			mark: '',
		},
	});

	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			form.reset();
			setLoading(false);
		}
	}, [form, open]);

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);

		try {
			await requestsService.markRequest({ id: request.id, mark: values.mark });

			toast('Mark submitted');
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
				className="w-[calc(100%-32px)] !max-w-90 bg-card shadow-regular"
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-light text-primary">
						Marking <span>{request.activity.name}</span> for {student.name} (
						{student.zid})
					</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<Controller
						name="mark"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<TextInput
									{...field}
									id="mark"
									aria-invalid={fieldState.invalid}
									placeholder={`Mark (out of ${request.activity.maxMark})`}
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} className="text-xs" />
								)}
							</Field>
						)}
					/>

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
