'use client';

import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import { Image } from '@/components/ui/base/image';
import { Link } from '@/components/ui/base/link';
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
			alt="star"
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
				&gt; login
			</Text>

			<Separator className="my-4" />

			<div className="space-y-4">
				<Tooltip>
					<TooltipTrigger asChild>
						<div tabIndex={0} className="outline-none">
							<Button disabled variant="primary" className="w-full py-4">
								<Text>Log in with zID@ad.unsw.edu.au</Text>
							</Button>
						</div>
					</TooltipTrigger>
					<TooltipContent className="text-center">
						This is currently unavailable,
						<br />
						please log in with your zID and zPass.
					</TooltipContent>
				</Tooltip>

				<Text
					size="lg"
					className="text-center text-primary font-mono font-semibold"
				>
					OR
				</Text>

				<LoginForm />

				<Text size="sm" className="text-center text-primary">
					Trouble logging in? Visit{' '}
					<Link
						href="https://iam.unsw.edu.au/"
						target="_blank"
						className="underline outline-none focus:text-primary/80 hover:text-primary/80"
					>
						UNSW Identity Manager
					</Link>
					.
				</Text>
			</div>
		</Card>
	);
}
