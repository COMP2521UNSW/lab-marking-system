'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { Loading } from '@/components/ui/base/loading';

export function RedirectIfLoggedIn({
	children,
}: {
	children?: React.ReactNode;
}) {
	const router = useRouter();
	const params = useSearchParams();
	const { user } = useAuth();

	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (user !== null) {
			const redirectUrl = params.get('redirect') || '/requests';
			router.push(redirectUrl);
		} else {
			setLoading(false);
		}
	}, [params, router, user]);

	return loading ? <Loading /> : children;
}
