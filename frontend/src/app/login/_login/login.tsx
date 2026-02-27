'use client';

import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { Image } from '@/components/ui/base/image';
import { Separator } from '@/components/ui/base/separator';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/base/tooltip';
import { Text } from '@/components/ui/base/typography';
import { cn } from '@/lib/utils';

import { LoginForm } from './login-form';

export function Login() {
	return (
		<div className="relative m-auto w-full max-w-90">
			<BoxDecoration className="absolute top-0 -translate-y-1/2" />

			<LoginBox />
		</div>
	);
}

function BoxDecoration({ className }: { className?: string }) {
	return (
		<div className={cn('w-full flex justify-between px-1', className)}>
			<Star className="rotate-45" />
			<div className="flex gap-1">
				<Star />
				<Star className="rotate-45" />
			</div>
		</div>
	);
}

function Star({ className }: { className?: string }) {
	return (
		<Image
			src="/star.svg"
			alt=""
			width={0}
			height={0}
			className={cn('size-6', className)}
		/>
	);
}

function LoginBox() {
	return (
		<Card className="p-4">
			<Text size="lg" className="text-center font-mono font-bold">
				<span aria-hidden>&gt;</span> login
			</Text>

			<Separator className="my-4" />

			<div className="space-y-4">
				<LogInWithSSOButton />

				<Text
					size="lg"
					className="text-center text-primary font-mono font-semibold"
				>
					OR
				</Text>

				<LoginForm />
			</div>
		</Card>
	);
}

function LogInWithSSOButton() {
	return (
		// https://ui.shadcn.com/docs/components/radix/tooltip - Disabled Button
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					className="inline-block w-full outline-none"
					tabIndex={0}
					role="button"
					aria-label="Log in with zID @ a d . u n s w . e d u . a u"
					aria-description="This is currently unavailable, please log in with your zID and zPass"
					aria-disabled
				>
					<Button
						disabled
						variant="primary"
						className="w-full py-4 outline-none"
					>
						<Text>Log in with zID@ad.unsw.edu.au</Text>
					</Button>
				</span>
			</TooltipTrigger>
			<TooltipContent className="text-center">
				This is currently unavailable,
				<br />
				please log in with your zID and zPass.
			</TooltipContent>
		</Tooltip>
	);
}
