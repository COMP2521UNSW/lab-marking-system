'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
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
	value,
	placeholder = 'Select an option...',
	emptyText = 'No options',
	className,
	onValueChange,
}: {
	id?: string;
	options: SelectOption[];
	value?: string;
	emptyText?: string;
	placeholder?: string;
	className?: string;
	onValueChange?: (value: string) => void;
}) {
	const [selected, setSelected] = React.useState<string | undefined>(value);

	const handleChange = (value: string) => {
		setSelected(value);
		if (value !== selected) {
			onValueChange?.(value);
		}
	};

	const selectedOption =
		selected === undefined
			? undefined
			: options.find((opt) => opt.value === selected)!;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				id={id}
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline h-9 px-3 py-2 whitespace-nowrap focus-ring',
					className,
				)}
			>
				{selectedOption ? (
					<Text>{selectedOption.label}</Text>
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
					<DropdownMenuRadioGroup
						value={selectedOption?.value}
						onValueChange={handleChange}
					>
						{options.map((option) => (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								className="text-base"
							>
								<Text>{option.label}</Text>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
