'use client';

import { CourseCode } from '@/components/ui/base/course-code';
import { Image } from '@/components/ui/base/image';
import { Text } from '@/components/ui/base/typography';
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
			<span className="text-primary">
				~<span aria-hidden="true">/</span>
				<CourseCode />
			</span>
			<span aria-hidden="true">/</span>marking
		</Text>
	);
}

export { LogoImage, LogoText };
