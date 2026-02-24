'use client';

import * as React from 'react';

import type { MarkingRequestAsStudent } from '@workspace/types/requests';

import { MIN_WIDTH } from '@/app/layout';
import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { TextInput } from '@/components/ui/base/input';
import { Select } from '@/components/ui/base/select';
import { toast } from '@/components/ui/base/toast';
import { Text } from '@/components/ui/base/typography';
import { MAX_REASON_LEN } from '@/lib/constants';
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

const reasonPresets = [
	{ value: 'wrong-activity', text: 'Selected the wrong activity' },
	{ value: 'not-ready', text: 'Not ready yet' },
];

export function WithdrawDialog({
	open,
	setOpen,
	request,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	request: MarkingRequestAsStudent;
}) {
	const [reason, setReason] = React.useState({ value: '', text: '' });

	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			setReason({ value: '', text: '' });
			setLoading(false);
		}
	}, [open]);

	const handleReasonSelect = (value: string) => {
		const newReason = reasonPresets.find((reason) => reason.value === value);
		if (newReason) {
			setReason(newReason);
		} else if (value === 'other') {
			setReason({ value: 'other', text: '' });
		}
	};

	const handleConfirm = async () => {
		setLoading(true);

		try {
			await requestsService.withdrawRequest({
				id: request.id,
				reason: reason.text,
			});

			toast('Request withdrawn');
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

	const trimmedReason = reason.text.trim();
	const canSubmit =
		trimmedReason.length > 0 && trimmedReason.length <= MAX_REASON_LEN;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				showCloseButton={false}
				className="w-[calc(100%-32px)] max-w-90! bg-card shadow-regular"
				style={{ minWidth: `${MIN_WIDTH - 32}px` }}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-light text-primary">
						Withdraw marking request for {request.activity.name}
					</DialogTitle>
				</DialogHeader>

				<Text className="text-center">
					Please select the reason for withdrawing your request.
				</Text>

				<div className="w-full space-y-4">
					<Select
						options={[
							...reasonPresets.map((reasonPreset) => ({
								value: reasonPreset.value,
								label: reasonPreset.text,
							})),
							{ value: 'other', label: 'Other' },
						]}
						value={reason.value}
						className="w-full"
						placeholder="Select a reason..."
						onValueChange={handleReasonSelect}
					/>

					{reason.value === 'other' && (
						<TextInput
							value={reason.text}
							maxLength={MAX_REASON_LEN}
							placeholder="Enter a reason"
							onChange={(e) => setReason({ ...reason, text: e.target.value })}
						/>
					)}
				</div>

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
