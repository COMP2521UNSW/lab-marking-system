'use client';

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ToasterProps } from 'sonner';
import { Toaster as Sonner, toast as sonnerToast } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

interface ToastProps {
	id: string | number;
	message: string;
}

function toast(message: string) {
	return sonnerToast.custom((id) => <Toast id={id} message={message} />);
}

function Toast(props: ToastProps) {
	const { message } = props;

	return (
		<div className="flex items-center mx-auto w-fit md:max-w-[364px] rounded-xl py-2 px-4 bg-foreground text-sm text-background font-sans shadow-lg ring-1 ring-black/5">
			{message}
		</div>
	);
}

export { toast, Toaster };
