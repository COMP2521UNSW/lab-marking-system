'use client';

import { Image } from '@/components/ui/base/image';
import { Text } from '@/components/ui/base/typography';
import { COURSE_CODE } from '@/lib/constants';
import { cn } from '@/lib/utils';

function LogoImage({
	width,
	height,
	className,
}: {
	width: number | `${number}`;
	height: number | `${number}`;
	className?: string;
}) {
	return (
		<Image
			src="/logo.svg"
			alt="Logo"
			width={width}
			height={height}
			className={className}
		/>
	);
}

function LogoText({ className, ...props }: React.ComponentProps<typeof Text>) {
	return (
		<Text className={cn('font-mono font-bold', className)} {...props}>
			<span className="text-primary">~/{COURSE_CODE}</span>/marking
		</Text>
	);
}

export { LogoImage, LogoText };
