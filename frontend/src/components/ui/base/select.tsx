'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export type SelectOption = {
	value: string;
	label: string;
};

export function Select({
	id,
	options,
	placeholder = 'Select an option...',
	emptyText = 'No options',
	className,
	onValueChange,
}: {
	id?: string;
	options: SelectOption[];
	emptyText?: string;
	placeholder?: string;
	className?: string;
	onValueChange?: (value: string) => void;
}) {
	const [selected, setSelected] = React.useState<SelectOption>();

	const handleSelect = (option: SelectOption) => {
		setSelected(option);
		if (option.value !== selected?.value) {
			onValueChange?.(option.value);
		}
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				id={id}
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline h-9 px-3 py-2 whitespace-nowrap focus-ring',
					className,
				)}
			>
				{selected ? (
					<Text>{selected.label}</Text>
				) : (
					<Text className="text-placeholder overflow-hidden whitespace-nowrap text-ellipsis">
						{placeholder}
					</Text>
				)}
				<ChevronDownIcon className="flex-none size-6 stroke-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] border-outline shadow-regular p-2 bg-card">
				{options.length === 0 ? (
					<DropdownMenuLabel className="p-2">{emptyText}</DropdownMenuLabel>
				) : (
					<DropdownMenuGroup>
						{options.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onSelect={() => handleSelect(option)}
							>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
