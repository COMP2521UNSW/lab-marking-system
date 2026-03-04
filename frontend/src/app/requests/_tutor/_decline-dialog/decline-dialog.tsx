'use client';

import * as React from 'react';

import { MAX_REASON_LEN } from '@workspace/lib/constants';
import type { MarkingRequestAsTutor } from '@workspace/types/requests';

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
import { ApiError } from '@/lib/errors';
import * as requestsService from '@/services/requests';

const reasonPresets = [
	{ value: 'wrong-activity', text: 'Selected the wrong activity' },
	{ value: 'not-found', text: 'Student could not be found' },
];

export function DeclineDialog({
	open,
	setOpen,
	request,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	request: MarkingRequestAsTutor;
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
			await requestsService.declineRequest({
				id: request.id,
				reason: reason.text,
			});

			toast('Request declined');
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
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">Decline marking request</DialogTitle>
				</DialogHeader>

				<Text className="text-center">
					Please select the reason for declining this request.
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
