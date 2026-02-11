'use client';

import { Helmet, HelmetProvider } from '@dr.pogodin/react-helmet';
import { Inclusive_Sans, Inconsolata } from 'next/font/google';

import { AuthProvider, useAuth } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Loading } from '@/components/ui/base/loading';
import { Toaster } from '@/components/ui/base/toast';
import { Navbar } from '@/components/ui/navbar/navbar';
import { COURSE_CODE } from '@/lib/constants';

import './globals.css';

const inclusiveSans = Inclusive_Sans({
	variable: '--font-inclusive-sans',
	weight: '400',
});

const inconsolata = Inconsolata({
	variable: '--font-inconsolata',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inclusiveSans.variable} ${inconsolata.variable} font-sans antialiased`}
			>
				<HelmetProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<AuthProvider>
							<AppLayout>{children}</AppLayout>
						</AuthProvider>
						<Toaster position="top-center" className="flex justify-center" />
					</ThemeProvider>
				</HelmetProvider>
			</body>
		</html>
	);
}

function AppLayout({
	children,
}: Readonly<{
	children?: React.ReactNode;
}>) {
	const { loading } = useAuth();

	return (
		<div className="grid grid-flow-col grid-rows-[auto_1fr] mx-auto min-h-screen w-full max-w-4xl min-w-[360px] px-4 pb-4">
			<Helmet
				defaultTitle={`${COURSE_CODE} Lab Marking`}
				titleTemplate={`%s | ${COURSE_CODE} Lab Marking`}
			/>
			<nav className="sticky top-0 z-50 py-4">
				<Navbar />
			</nav>
			<div>{loading ? <Loading /> : children}</div>
		</div>
	);
}
