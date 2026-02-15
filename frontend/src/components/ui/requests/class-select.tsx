'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import type { ActiveClasses, Class } from '@workspace/types/classes';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

export function ClassSelect({
	classes,
	value,
	className,
	onValueChange,
}: {
	classes: ActiveClasses;
	value?: Class;
	className?: string;
	onValueChange?: (value: Class) => void;
}) {
	const [selected, setSelected] = React.useState<Class | undefined>(value);

	const handleSelect = (value: string) => {
		const selectedClass = (classes.current.find((cls) => cls.code === value) ||
			classes.upcoming.find((cls) => cls.code === value) ||
			classes.recent.find((cls) => cls.code === value))!;

		setSelected(selectedClass);
		if (selectedClass !== selected) {
			onValueChange?.(selectedClass);
		}
	};

	const noClasses =
		classes.current.length + classes.upcoming.length + classes.recent.length ===
		0;

	// Does not use Select because Select does not have a fade-out animation???
	// (why?????)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline h-9 px-3 py-2 whitespace-nowrap focus-ring',
					className,
				)}
			>
				{selected ? (
					<Text>
						{selected.code} ({selected.labLocation})
					</Text>
				) : (
					<Text className="text-placeholder">Select a class...</Text>
				)}
				<ChevronDownIcon className="flex-none size-6 stroke-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
				{noClasses ? (
					<DropdownMenuLabel>No open classes!</DropdownMenuLabel>
				) : (
					<DropdownMenuRadioGroup
						onValueChange={handleSelect}
						className="space-y-1"
					>
						<ClassSelectGroup classes={classes.current} label="Current" />
						<ClassSelectGroup
							classes={classes.upcoming}
							label="Starting soon"
						/>
						<ClassSelectGroup classes={classes.recent} label="Recently ended" />
					</DropdownMenuRadioGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ClassSelectGroup({
	classes,
	label,
}: {
	classes: Class[];
	label: string;
}) {
	return (
		classes.length > 0 && (
			<DropdownMenuGroup>
				<DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs">
					{label}
				</DropdownMenuLabel>
				{classes.map((cls) => (
					<DropdownMenuRadioItem key={cls.code} value={cls.code}>
						{cls.code} ({cls.labLocation})
					</DropdownMenuRadioItem>
				))}
			</DropdownMenuGroup>
		)
	);
}
