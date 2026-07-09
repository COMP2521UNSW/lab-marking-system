'use client';

import * as React from 'react';

import { MAX_REASON_LEN } from '@workspace/lib/constants';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { TextInput } from '@/components/ui/base/input';
import { Text } from '@/components/ui/base/typography';

export function DenyDialog({
	open,
	setOpen,
	onConfirmed,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	onConfirmed: (reason: string) => Promise<void>;
}) {
	const [prevOpen, setPrevOpen] = React.useState(open);

	const [reason, setReason] = React.useState('');

	const [loading, setLoading] = React.useState(false);

	if (open !== prevOpen) {
		setPrevOpen(open);
		if (open) {
			setReason('');
			setLoading(false);
		}
	}

	const handleConfirm = async () => {
		setLoading(true);

		try {
			await onConfirmed(reason);

			setOpen(false);
		} catch {
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
