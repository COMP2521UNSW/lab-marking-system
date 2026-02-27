'use client';

import { ChevronDownIcon, StarIcon } from 'lucide-react';
import * as React from 'react';

import type { ActiveClasses, Class } from '@workspace/types/classes';

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

export function ClassSelect({
	classes,
	selectedClass,
	className,
	enrolledClassCode,
	onValueChange,
	...props
}: {
	classes: ActiveClasses;
	selectedClass?: Class;
	className?: string;
	enrolledClassCode?: string | null;
	onValueChange?: (value: Class) => void;
} & React.ComponentProps<typeof DropdownMenuTrigger>) {
	const [selected, setSelected] = React.useState<Class | undefined>(
		selectedClass,
	);

	const handleSelect = (cls: Class) => {
		setSelected(cls);
		if (cls.code !== selected?.code) {
			onValueChange?.(cls);
		}
	};

	const noClasses =
		classes.current.length + classes.upcoming.length + classes.recent.length ===
		0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					'flex items-center justify-between gap-2 rounded-weak border border-outline h-9 px-3 py-2 whitespace-nowrap focus-ring',
					className,
				)}
				{...props}
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
			<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) p-2">
				{noClasses ? (
					<DropdownMenuLabel>No open classes!</DropdownMenuLabel>
				) : (
					<DropdownMenuGroup className="space-y-1">
						<ClassSelectGroup
							classes={classes.current}
							label="Current"
							enrolledClassCode={enrolledClassCode}
							handleSelect={handleSelect}
						/>
						<ClassSelectGroup
							classes={classes.upcoming}
							label="Starting soon"
							enrolledClassCode={enrolledClassCode}
							handleSelect={handleSelect}
						/>
						<ClassSelectGroup
							classes={classes.recent}
							label="Recently ended"
							enrolledClassCode={enrolledClassCode}
							handleSelect={handleSelect}
						/>
					</DropdownMenuGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ClassSelectGroup({
	classes,
	label,
	enrolledClassCode,
	handleSelect,
}: {
	classes: Class[];
	label: string;
	enrolledClassCode?: string | null;
	handleSelect: (cls: Class) => void;
}) {
	return (
		classes.length > 0 && (
			<div>
				<DropdownMenuLabel
					aria-label=""
					className="text-muted-foreground px-2 py-1.5 text-xs"
				>
					{label}
				</DropdownMenuLabel>
				{classes.map((cls) => (
					<DropdownMenuItem
						key={cls.code}
						className="flex justify-between"
						onSelect={() => handleSelect(cls)}
					>
						{cls.code} ({cls.labLocation})
						{cls.code === enrolledClassCode && (
							<StarIcon className="stroke-0 fill-yellow-500" />
						)}
					</DropdownMenuItem>
				))}
			</div>
		)
	);
}
