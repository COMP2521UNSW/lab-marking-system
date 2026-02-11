'use client';

import { Helmet } from '@dr.pogodin/react-helmet';

import { RedirectIfLoggedIn } from '@/components/guards/redirect-if-logged-in';

import { Login } from './_login/login';

export default function Page() {
	return (
		<RedirectIfLoggedIn>
			<Helmet title="Login" />

			<div className="h-full flex">
				<Login />
			</div>
		</RedirectIfLoggedIn>
	);
}
