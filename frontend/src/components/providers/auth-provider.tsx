'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import type { SessionUser } from '@workspace/types/users';

import * as authService from '@/services/auth';

interface AuthContextType {
	user: SessionUser | null;
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
	const [user, setUser] = React.useState<SessionUser | null>(null);
	const [loading, setLoading] = React.useState(true);

	const router = useRouter();
	const [isPending, startTransition] = React.useTransition();

	React.useEffect(() => {
		const fetchUser = async () => {
			const user = await authService.getUser();
			setUser(user);
			setLoading(false);
		};

		fetchUser();
	}, []);

	const logIn = async (zid: string, password: string) => {
		const user = await authService.logIn({ zid, password });
		setUser(user);
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
		} catch (error) {
			console.error(error);
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
