'use client';

import { Helmet } from '@dr.pogodin/react-helmet';

import { Card } from '@/components/ui/base/card';
import { CourseCode } from '@/components/ui/base/course-code';
import { LogoImage, LogoText } from '@/components/ui/base/logo';
import { Text } from '@/components/ui/base/typography';

export default function Page() {
	return (
		<>
			<Helmet title="About" />

			<Card className="flex flex-col items-center gap-4 min-h-full p-6 text-center">
				<LogoImage height={0} width={0} className="w-24" />

				<LogoText className="text-xl" />

				<Text className="text-xl font-mono">
					created by <CourseCode code={'COMP2521'} /> staff in 2026!
				</Text>
			</Card>
		</>
	);
}
