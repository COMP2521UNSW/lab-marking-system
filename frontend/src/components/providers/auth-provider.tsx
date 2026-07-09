'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import type { UserDetails } from '@workspace/types/users';

import { errorToast } from '@/components/ui/base/toast';
import authService from '@/services/auth';

interface AuthContextType {
	user: UserDetails | null;
	loading: boolean;
	logIn: (zid: string, zpass: string) => Promise<void>;
	logOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
	user: null,
	loading: true,
	logIn: async () => {},
	logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<UserDetails | null>(null);
	const [loading, setLoading] = React.useState(true);

	const router = useRouter();
	const [isPending, startTransition] = React.useTransition();

	React.useEffect(() => {
		const fetchUser = async () => {
			try {
				const user = await authService.getUser();
				setUser(user);
				setLoading(false);
			} catch (err) {
				errorToast(err);
			}
		};

		fetchUser();
	}, []);

	const logIn = async (zid: string, password: string) => {
		try {
			const user = await authService.logIn({ zid, password });
			setUser(user);
		} catch (err) {
			throw err;
		}
	};

	const logOut = async () => {
		try {
			setLoading(true);
			await authService.logOut();
			setUser(null);

			startTransition(() => {
				router.push('/login');
				setLoading(false);
			});
		} catch (err) {
			throw err;
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, loading: loading || isPending, logIn, logOut }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => React.useContext(AuthContext);
