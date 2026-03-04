'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { removePrefix } from '@workspace/lib/string';

import { useAuth } from '@/components/providers/auth-provider';
import { Loading } from '@/components/ui/base/loading';

export function LoginRequired({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { user } = useAuth();

	React.useEffect(() => {
		if (!user) {
			const params = new URLSearchParams([
				[
					'redirect',
					removePrefix(
						window.location.pathname,
						process.env.NEXT_PUBLIC_BASE_PATH || '',
					),
				],
			]);
			router.replace(`/login?${params}`);
		}
	}, [router, user]);

	return !user ? <Loading /> : children;
}
