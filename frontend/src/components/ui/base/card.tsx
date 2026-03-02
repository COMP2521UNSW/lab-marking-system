import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('rounded-strong border bg-card shadow-regular', className)}
			{...props}
		/>
	);
}

export { Card };
