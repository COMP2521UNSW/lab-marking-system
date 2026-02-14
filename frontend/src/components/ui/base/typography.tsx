import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function H1({ className, ...props }: React.ComponentProps<'h1'>) {
	return <h1 className={cn('text-3xl font-semibold', className)} {...props} />;
}

export function H2({ className, ...props }: React.ComponentProps<'h2'>) {
	return <h2 className={cn('text-2xl font-semibold', className)} {...props} />;
}

export function H3({ className, ...props }: React.ComponentProps<'h3'>) {
	return <h3 className={cn('text-xl font-semibold', className)} {...props} />;
}

export function H4({ className, ...props }: React.ComponentProps<'h4'>) {
	return <h4 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function H5({ className, ...props }: React.ComponentProps<'h5'>) {
	return <h5 className={cn('text-base font-semibold', className)} {...props} />;
}

export function H6({ className, ...props }: React.ComponentProps<'h6'>) {
	return <h6 className={cn('text-sm font-semibold', className)} {...props} />;
}

////////////////////////////////////////////////////////////////////////

const textVariants = cva('', {
	variants: {
		size: {
			sm: 'text-xs',
			md: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export function Text({
	className,
	size,
	...props
}: React.ComponentProps<'p'> & VariantProps<typeof textVariants>) {
	return <p className={cn(textVariants({ size, className }))} {...props} />;
}
