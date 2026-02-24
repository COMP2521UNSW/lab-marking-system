'use client';

import { Helmet } from '@dr.pogodin/react-helmet';

import { Card } from '@/components/ui/base/card';
import { LogoImage, LogoText } from '@/components/ui/base/logo';
import { Text } from '@/components/ui/base/typography';

export default function Page() {
	return (
		<>
			<Helmet title="About" />

			<Card className="flex flex-col items-center min-h-full gap-4 p-6">
				<LogoImage height={0} width={0} className="w-24" />

				<LogoText className="text-center text-xl" />

				<Text className="text-center text-xl font-mono">
					created by COMP2521 staff in 2026!
				</Text>
			</Card>
		</>
	);
}
