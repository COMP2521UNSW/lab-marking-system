'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn('flex flex-col gap-2', className)}
			{...props}
		/>
	);
}

const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
		indicatorClassName?: string;
	}
>(({ className, indicatorClassName, ...props }, ref) => {
	const [indicatorStyle, setIndicatorStyle] = React.useState({
		left: 0,
		top: 0,
		width: 0,
		height: 0,
	});
	const [mounted, setMounted] = React.useState(false);
	const tabsListRef = React.useRef<HTMLDivElement | null>(null);

	const updateIndicator = React.useCallback(() => {
		if (!tabsListRef.current) return;

		const activeTab = tabsListRef.current.querySelector<HTMLElement>(
			'[data-state="active"]',
		);
		if (!activeTab) return;

		const activeRect = activeTab.getBoundingClientRect();
		const tabsRect = tabsListRef.current.getBoundingClientRect();

		requestAnimationFrame(() => {
			setIndicatorStyle({
				left: activeRect.left - tabsRect.left,
				top: activeRect.top - tabsRect.top,
				width: activeRect.width,
				height: activeRect.height,
			});
			setMounted(true);
		});
	}, []);

	React.useEffect(() => {
		const timeoutId = setTimeout(updateIndicator, 0);

		window.addEventListener('resize', updateIndicator);
		const observer = new MutationObserver(updateIndicator);

		if (tabsListRef.current) {
			observer.observe(tabsListRef.current, {
				attributes: true,
				childList: true,
				subtree: true,
			});
		}

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('resize', updateIndicator);
			observer.disconnect();
		};
	}, [updateIndicator]);

	return (
		<div className="relative" ref={tabsListRef}>
			<TabsPrimitive.List
				ref={ref}
				data-slot="tabs-list"
				className={cn(
					'relative inline-flex justify-center items-center w-fit h-9 rounded-lg p-[3px] bg-muted text-muted-foreground',
					!mounted && 'group is-mounting',
					className,
				)}
				{...props}
			/>
			<div
				className={cn(
					'absolute rounded-[calc(var(--radius-lg)_-_1px)] border border-transparent shadow-sm bg-background duration-300 ease-in-out',
					mounted ? 'block' : 'hidden',
					indicatorClassName,
				)}
				style={indicatorStyle}
			/>
		</div>
	);
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		data-slot="tabs-trigger"
		className={cn(
			"group-[.is-mounting]:data-[state=active]:bg-primary not-data-[state=active]:cursor-pointer data-[state=active]:text-white focus-visible:ring-ring/50 outline-none focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent p-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 z-10",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		data-slot="tabs-content"
		className={cn('flex-1 outline-none mt-2', className)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
