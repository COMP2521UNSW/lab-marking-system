import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/base/input-group';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/base/tooltip';
import { cn } from '@/lib/utils';

////////////////////////////////////////////////////////////////////////////////

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'file:text-foreground placeholder:text-placeholder selection:bg-primary selection:text-primary-foreground border-outline h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				className,
			)}
			{...props}
		/>
	);
}

////////////////////////////////////////////////////////////////////////////////

function TextInput(props: Omit<React.ComponentProps<'input'>, 'type'>) {
	return <Input type="text" {...props} />;
}

////////////////////////////////////////////////////////////////////////////////

function PasswordInput({
	...props
}: Omit<React.ComponentProps<typeof Input>, 'type'>) {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<InputGroup className="border-outline">
			<InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />
			<InputGroupAddon align="inline-end">
				<Tooltip>
					<TooltipTrigger asChild>
						<InputGroupButton
							className="rounded-md -ms-1 -me-1"
							size="icon-sm"
							role="checkbox"
							aria-label="Show password"
							aria-checked={showPassword}
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeIcon className="size-5 stroke-[1.25] stroke-placeholder" />
							) : (
								<EyeOffIcon className="size-5 stroke-[1.25] stroke-placeholder" />
							)}
						</InputGroupButton>
					</TooltipTrigger>
					<TooltipContent>
						{showPassword ? 'Hide password' : 'Show password'}
					</TooltipContent>
				</Tooltip>
			</InputGroupAddon>
		</InputGroup>
	);
}

////////////////////////////////////////////////////////////////////////////////

export { Input, PasswordInput, TextInput };
