'use client';

import { CircleXIcon } from 'lucide-react';
import * as React from 'react';

import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export function Tag({
	label,
	className,
	onDeleteClick,
}: {
	label: string;
	className?: string;
	onDeleteClick?: (event: React.MouseEvent | React.KeyboardEvent) => void;
}) {
	const handleKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
		if ([' ', 'Enter'].includes(event.key)) {
			onDeleteClick?.(event);
			event.preventDefault();
		}
	};

	return (
		<div
			className={cn(
				'h-6 inline-flex items-center gap-1 rounded-full border border-tag-border px-1.5 bg-tag-background',
				className,
			)}
		>
			<Text>{label}</Text>
			{onDeleteClick && (
				// can't make this an actual button because otherwise there will
				// be nested buttons
				<CircleXIcon
					role="button"
					tabIndex={0} // for tab navigation
					onKeyDown={handleKeyDown}
					className="size-4 stroke-1.2 stroke-primary cursor-pointer rounded-full focus-ring"
					onClick={onDeleteClick}
				/>
			)}
		</div>
	);
}
