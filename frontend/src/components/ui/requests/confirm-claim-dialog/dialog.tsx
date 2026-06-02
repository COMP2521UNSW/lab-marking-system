'use client';

import { Button } from '@/components/ui/base/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/base/dialog';
import { Text } from '@/components/ui/base/typography';

export function ConfirmClaimDialog({
	open,
	tutorName,
	onConfirm,
	onCancel,
}: {
	open: boolean;
	tutorName: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle variant="lg">Already claimed</DialogTitle>
				</DialogHeader>

				<Text>
					This request has already been claimed by <b>{tutorName}</b>. Are you
					sure you want to claim it?
				</Text>

				<div className="flex gap-4">
					<Button className="flex-1" onClick={onConfirm}>
						<Text>Claim</Text>
					</Button>
					<Button className="flex-1" variant="danger" onClick={onCancel}>
						<Text>Cancel</Text>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
