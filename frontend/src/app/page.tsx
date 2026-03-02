'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Loading } from '@/components/ui/base/loading';

export default function Page() {
	const router = useRouter();

	React.useEffect(() => {
		router.replace('/requests');
	}, [router]);

	return <Loading />;
}
