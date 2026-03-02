import { SearchIcon } from 'lucide-react';

import { TextInput } from '@/components/ui/base/input';
import { cn } from '@/lib/utils';

export function SearchBar({
	className,
	...props
}: React.ComponentProps<'input'>) {
	return (
		<div className="relative">
			<TextInput
				className={cn('rounded-full border border-outline pe-10', className)}
				{...props}
			/>

			<SearchIcon className="absolute right-3 top-0 h-full w-4.5 sm:w-5 stroke-muted-foreground" />
		</div>
	);
}
