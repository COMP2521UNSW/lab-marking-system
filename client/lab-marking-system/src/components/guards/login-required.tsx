'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { Loading } from '@/components/ui/base/loading';

export function LoginRequired({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { user } = useAuth();

	React.useEffect(() => {
		if (!user) {
			const params = new URLSearchParams([
				['redirect', window.location.pathname],
			]);
			router.replace(`/login?${params}`);
		}
	}, [router, user]);

	return <div>{!user ? <Loading /> : children}</div>;
}
