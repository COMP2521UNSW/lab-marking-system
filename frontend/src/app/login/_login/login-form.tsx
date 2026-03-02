'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/base/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/base/field';
import { PasswordInput, TextInput } from '@/components/ui/base/input';
import { Link } from '@/components/ui/base/link';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { ApiError } from '@/lib/errors';

const formSchema = z.object({
	zid: z.string().min(1, { message: 'zID is required' }),
	zpass: z.string().min(1, { message: 'zPass is required' }),
});

export function LoginForm() {
	const { logIn } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			zid: '',
			zpass: '',
		},
	});

	const [loading, setLoading] = React.useState(false);

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);

		try {
			await logIn(values.zid, values.zpass);
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
		<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
			<FieldGroup className="gap-4">
				<Controller
					name="zid"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field className="gap-1.5" data-invalid={fieldState.invalid}>
							<TextInput
								{...field}
								aria-invalid={fieldState.invalid}
								placeholder="zID"
							/>
							{fieldState.invalid && (
								<FieldError errors={[fieldState.error]} className="text-xs" />
							)}
						</Field>
					)}
				/>

				<Controller
					name="zpass"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field className="gap-1.5" data-invalid={fieldState.invalid}>
							<PasswordInput
								{...field}
								aria-invalid={fieldState.invalid}
								placeholder="zPass"
							/>
							{fieldState.invalid && (
								<FieldError errors={[fieldState.error]} className="text-xs" />
							)}
						</Field>
					)}
				/>
			</FieldGroup>

			<Button loading={loading} className="w-full">
				<Text>Log In</Text>
			</Button>

			<Text size="sm" className="text-center text-primary">
				Trouble logging in? Visit{' '}
				<Link
					href="https://iam.unsw.edu.au/"
					target="_blank"
					className="underline outline-none focus:text-primary/80 hover:text-primary/80"
				>
					UNSW Identity Manager
				</Link>
				.
			</Text>
		</form>
	);
}
