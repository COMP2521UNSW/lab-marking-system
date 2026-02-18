import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import {
	Button,
	buttonVariants as linkButtonVariants,
} from '@/components/ui/base/button';
import { Link } from '@/components/ui/base/link';
import { cn } from '@/lib/utils';

function LinkButton({
	className,
	variant,
	size,
	disabled = false,
	children,
	...props
}: React.ComponentProps<typeof Link> &
	VariantProps<typeof linkButtonVariants> & {
		loading?: boolean;
		disabled?: boolean;
	}) {
	return disabled ? (
		<Button
			variant={variant}
			size={size}
			disabled={disabled}
			className={className}
		>
			{children}
		</Button>
	) : (
		<Link
			className={cn(
				linkButtonVariants({ variant, size, className }),
				'relative',
			)}
			{...props}
		>
			{children}
		</Link>
	);
}

export { LinkButton, linkButtonVariants };
