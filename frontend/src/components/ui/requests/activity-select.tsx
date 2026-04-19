'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import type {
	ActivityAsStudent,
	ActivityWithStatus,
} from '@workspace/types/activities';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Tag } from '@/components/ui/base/tag';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export function ActivitySelect({
	activities,
	preselected = [],
	placeholder = 'Select activities...',
	className,
	onValueChange,
	...props
}: {
	activities: ActivityWithStatus[];
	preselected?: ActivityAsStudent[];
	placeholder?: string;
	className?: string;
	onValueChange?: (ids: string[]) => void;
} & React.ComponentProps<typeof DropdownMenuTrigger>) {
	const [selected, setSelected] = React.useState<string[]>([]);

	const handleSelect = (value: string) => {
		const newSelected = selected.includes(value)
			? selected.filter((val) => val !== value)
			: [...selected, value];
		setSelected(newSelected);
		onValueChange?.(newSelected);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline py-[5px] px-3 whitespace-nowrap focus-ring',
					className,
				)}
				{...props}
			>
				<SelectedActivities
					activities={activities}
					preselected={preselected}
					selected={selected}
					placeholder={placeholder}
					className="overflow-hidden"
				/>
				<ChevronDownIcon className="flex-none size-6 stroke-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) border border-outline shadow-regular p-2 bg-card">
				<ActivitySelectList
					activities={activities}
					preselected={preselected}
					selected={selected}
					onSelect={handleSelect}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SelectedActivities({
	activities,
	preselected,
	selected,
	placeholder,
	className,
}: {
	activities: ActivityWithStatus[];
	preselected: ActivityAsStudent[];
	selected: string[];
	placeholder: string;
	className?: string;
}) {
	return (
		<div className={cn('flex items-center gap-2 flex-wrap', className)}>
			{preselected.map((activity) => {
				return <Tag key={activity.code} label={activity.name} />;
			})}

			{selected.map((code) => {
				const option = activities.find(
					({ activity }) => activity.code === code,
				);
				return (
					option && (
						<Tag key={option.activity.code} label={option.activity.name} />
					)
				);
			})}

			{preselected.length === 0 && selected.length === 0 && (
				<Text className="text-placeholder truncate">{placeholder}</Text>
			)}
		</div>
	);
}

function ActivitySelectList({
	activities,
	preselected,
	selected,
	onSelect,
}: {
	activities: ActivityWithStatus[];
	preselected: ActivityAsStudent[];
	selected: string[];
	onSelect: (value: string) => void;
}) {
	return activities.map(({ activity, marked }) => {
		const isPreselected = !!preselected.find(
			(preselectedActivity) => preselectedActivity.code === activity.code,
		);
		const isSelected = selected.includes(activity.code);

		const status = marked
			? 'already marked'
			: isPreselected
				? 'already requested'
				: isSelected
					? 'selected'
					: null;

		return (
			<DropdownMenuCheckboxItem
				key={activity.code}
				checked={isSelected}
				disabled={marked || isPreselected}
				onClick={(e) => {
					onSelect(activity.code);
					e.preventDefault();
				}}
			>
				<Text>
					{activity.name} {status && ` - ${status}`}
				</Text>
			</DropdownMenuCheckboxItem>
		);
	});
}
