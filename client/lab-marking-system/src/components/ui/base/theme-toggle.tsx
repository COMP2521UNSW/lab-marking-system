'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/base/button';

export function ThemeToggle({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { theme, setTheme } = useTheme();

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		setTheme(theme === 'light' ? 'dark' : 'light');
		onClick?.(e);
	};

	return (
		<Button
			className={className}
			variant="ghost"
			size="icon"
			title="Toggle theme"
			onClick={handleClick}
			{...props}
		>
			<SunIcon className="size-6 stroke-black rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<MoonIcon className="absolute size-6 stroke-white scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
