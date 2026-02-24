'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Tag } from '@/components/ui/base/tag';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

type SelectOption = {
	value: string;
	label: string;
	marked: boolean;
};

export function ActivitySelect({
	options,
	preselected = [],
	placeholder = 'Select activities...',
	className,
	onChange,
}: {
	options: SelectOption[];
	preselected?: string[];
	placeholder?: string;
	className?: string;
	onChange?: (ids: string[]) => void;
}) {
	const ref = React.useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<string[]>([]);

	const handleSelect = (value: string) => {
		const newSelected = selected.includes(value)
			? selected.filter((val) => val !== value)
			: [...selected, value];
		setSelected(newSelected);
		onChange?.(newSelected);
	};

	const handleDeleteClick = (value: string) => {
		const newSelected = selected.filter((val) => val !== value);
		setSelected(newSelected);
		onChange?.(newSelected);
	};

	const isInCloseButton = (target: EventTarget | null) => {
		return target instanceof SVGElement && ref.current?.contains(target);
	};

	return (
		<DropdownMenu open={open} modal={true}>
			<DropdownMenuTrigger
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline py-[5px] px-3 whitespace-nowrap focus-ring',
					className,
				)}
				onPointerDown={(e) => {
					if (!isInCloseButton(e.target)) setOpen(true);
				}}
				onKeyDown={(e) => {
					if ([' ', 'Enter'].includes(e.key) && !isInCloseButton(e.target)) {
						setOpen(true);
					}
				}}
			>
				<SelectedActivities
					ref={ref}
					options={options}
					preselected={preselected}
					selected={selected}
					placeholder={placeholder}
					onDeleteClick={handleDeleteClick}
					className="overflow-hidden"
				/>
				<ChevronDownIcon className="flex-none size-6 stroke-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[var(--radix-dropdown-menu-trigger-width)] border border-outline shadow-regular p-2 bg-card"
				onPointerDownOutside={(e) => {
					if (!isInCloseButton(e.target)) setOpen(false);
				}}
				onEscapeKeyDown={() => setOpen(false)}
			>
				<ActivitySelectList
					options={options}
					preselected={preselected}
					selected={selected}
					onSelect={handleSelect}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SelectedActivities({
	ref,
	options,
	preselected,
	selected,
	placeholder,
	onDeleteClick,
	className,
}: {
	ref: React.RefObject<HTMLDivElement | null>;
	options: SelectOption[];
	preselected: string[];
	selected: string[];
	placeholder: string;
	onDeleteClick: (id: string) => void;
	className?: string;
}) {
	return (
		<div
			ref={ref}
			className={cn('flex items-center gap-2 flex-wrap', className)}
		>
			{preselected.map((value) => {
				const option = options.find((opt) => opt.value === value);
				return option && <Tag key={value} label={option.label} />;
			})}

			{selected.map((value) => {
				const option = options.find((opt) => opt.value === value);
				return (
					option && (
						<Tag
							key={option.value}
							label={option.label}
							onDeleteClick={() => onDeleteClick(option.value)}
						/>
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
	options,
	preselected,
	selected,
	onSelect,
}: {
	options: SelectOption[];
	preselected: string[];
	selected: string[];
	onSelect: (value: string) => void;
}) {
	return options.map((option) => {
		const status = option.marked
			? 'already marked'
			: preselected.includes(option.value)
				? 'already requested'
				: selected.includes(option.value)
					? 'selected'
					: null;

		return (
			<DropdownMenuCheckboxItem
				key={option.value}
				checked={selected.includes(option.value)}
				disabled={option.marked || preselected.includes(option.value)}
				onClick={(e) => {
					onSelect(option.value);
					e.preventDefault();
				}}
			>
				<Text>
					{option.label} {status && ` - ${status}`}
				</Text>
			</DropdownMenuCheckboxItem>
		);
	});
}
