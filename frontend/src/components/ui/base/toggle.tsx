'use client';

import {
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/components/ui/base/animated-tabs';
import { Text } from '@/components/ui/base/typography';

export type ToggleOption = {
	value: string;
	label: string;
};

export function Toggle({
	options,
	defaultValue,
	onValueChange,
}: {
	options: ToggleOption[];
	defaultValue: string;
	onValueChange: (value: string) => void;
}) {
	return (
		<Tabs
			className="inline-flex"
			defaultValue={defaultValue}
			onValueChange={onValueChange}
		>
			<TabsList
				className="rounded-full border border-border p-0 bg-card text-foreground"
				indicatorClassName="rounded-full bg-primary"
			>
				{options.map((option) => (
					<TabsTrigger
						key={option.value}
						value={option.value}
						className="h-full text-base rounded-full"
					>
						<Text>{option.label}</Text>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
