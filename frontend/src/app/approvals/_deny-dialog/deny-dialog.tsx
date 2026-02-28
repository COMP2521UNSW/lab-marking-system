'use client';

import * as React from 'react';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { TextInput } from '@/components/ui/base/input';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { MAX_REASON_LEN } from '@/lib/constants';
import { ApiError } from '@/lib/errors';

export function DenyDialog({
	open,
	setOpen,
	onConfirmed,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	onConfirmed: (reason: string) => Promise<void>;
}) {
	const [reason, setReason] = React.useState('');

	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			setReason('');
		}
	}, [open]);

	const handleConfirm = async () => {
		setLoading(true);

		try {
			await onConfirmed(reason);

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

	const trimmedReason = reason.trim();
	const canSubmit =
		trimmedReason.length > 0 && trimmedReason.length <= MAX_REASON_LEN;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">Deny Manual Request</DialogTitle>
				</DialogHeader>

				<Text className="text-center">
					Please enter a reason for denying this request.
				</Text>

				<TextInput
					value={reason}
					maxLength={MAX_REASON_LEN}
					placeholder="Enter a reason"
					onChange={(e) => setReason(e.target.value)}
				/>

				<div className="flex gap-4">
					<Button
						className="flex-1"
						disabled={!canSubmit || loading}
						loading={loading}
						onClick={handleConfirm}
					>
						<Text>Confirm</Text>
					</Button>
					<Button
						className="flex-1"
						variant="danger"
						onClick={() => setOpen(false)}
					>
						<Text>Cancel</Text>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
