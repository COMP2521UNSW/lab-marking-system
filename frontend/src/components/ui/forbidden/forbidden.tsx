'use client';

import { Helmet } from '@dr.pogodin/react-helmet';

import { Card } from '@/components/ui/base/card';
import { Image } from '@/components/ui/base/image';
import { Text } from '@/components/ui/base/typography';

export function Forbidden() {
	return (
		<>
			<Helmet title="Forbidden" />

			<Card className="flex flex-col items-center gap-6 p-6">
				<Text className="text-center">
					You don&rsquo;t have permission to access this page.
				</Text>

				<Image
					src="/i-know-what-you-are.png"
					alt="Forbidden"
					className="w-56"
					width={224}
					height={224}
				/>
			</Card>
		</>
	);
}
