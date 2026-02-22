'use client';

import { HandRaisedIcon } from '@heroicons/react/24/outline';
import {
	CheckSquareIcon,
	ChevronDownIcon,
	InfoIcon,
	LogInIcon,
	LogOutIcon,
	MenuIcon,
	SearchIcon,
	UserIcon,
} from 'lucide-react';
import * as React from 'react';

import type { UserDetails } from '@workspace/types/users';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/base/button';
import { Card } from '@/components/ui/base/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Link } from '@/components/ui/base/link';
import { LogoImage, LogoText } from '@/components/ui/base/logo';
import { ThemeToggle } from '@/components/ui/base/theme-toggle';
import { Text } from '@/components/ui/base/typography';
import { isAdmin, isTutor } from '@/lib/roles';
import { cn } from '@/lib/utils';

export type NavLink = {
	Icon?: React.ExoticComponent<React.SVGProps<SVGSVGElement>>;
	label: string;
	href: string;
};

export function Navbar({ className }: { className?: string }) {
	const { user } = useAuth();

	const navLinks = getNavLinks(user);

	return (
		<Card
			className={cn(
				'flex justify-between items-center gap-2 h-[40px] sm:h-[50px] p-0.5 pe-1.5 bg-card',
				className,
			)}
		>
			<Logo />

			<div>
				{/* Desktop */}
				<div className="hidden sm:flex items-center gap-2">
					{navLinks.length > 0 && <DesktopPagesMenu navLinks={navLinks} />}
					<ThemeToggle />
					{user ? (
						<NavDropdownMenu
							MenuIcon={<UserIcon className="size-6" />}
							user={user}
							contentClassName="hidden sm:block"
							sideOffset={15}
						/>
					) : (
						<Button asChild variant="ghost" size="icon">
							<Link href="/login">
								<LogInIcon className="size-6" />
							</Link>
						</Button>
					)}
				</div>

				{/* Mobile */}
				<div className="flex items-center gap-1 sm:hidden">
					<ThemeToggle className="size-8 [&_svg]:size-5" />
					<NavDropdownMenu
						MenuIcon={<MenuIcon className="size-5" />}
						user={user}
						navLinks={navLinks}
						contentClassName="block sm:hidden"
						sideOffset={12}
					/>
				</div>
			</div>
		</Card>
	);
}

function getNavLinks(user: UserDetails | null): NavLink[] {
	const links: NavLink[] = [];

	if (user) {
		if (isTutor(user.role)) {
			links.push({
				Icon: HandRaisedIcon,
				label: 'Marking Requests',
				href: '/requests',
			});
		} else {
			links.push({
				Icon: HandRaisedIcon,
				label: 'Request Marking',
				href: '/requests',
			});
		}
		if (isTutor(user.role)) {
			links.push({
				Icon: SearchIcon,
				label: 'Student Search',
				href: '/students',
			});
		}
		if (isAdmin(user.role)) {
			links.push({
				Icon: CheckSquareIcon,
				label: 'Mark Approvals',
				href: '/approvals',
			});
		}
	}
	links.push({ Icon: InfoIcon, label: 'About', href: '/about' });

	return links;
}

////////////////////////////////////////////////////////////////////////////////

function Logo() {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 px-1 rounded-weak focus-ring"
		>
			<LogoImage width={0} height={0} className="w-[35px] sm:w-[45px]" />

			<LogoText className="whitespace-nowrap sm:text-base" />
		</Link>
	);
}

////////////////////////////////////////////////////////////////////////////////

function DesktopPagesMenu({ navLinks }: { navLinks: NavLink[] }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="font-mono font-bold">
					<ChevronDownIcon className="size-6" /> pages
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="hidden sm:block min-w-48"
				align="start"
				alignOffset={0}
				sideOffset={15}
			>
				<NavbarMenuLinkGroup navLinks={navLinks} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

////////////////////////////////////////////////////////////////////////////////

function NavDropdownMenu({
	MenuIcon,
	user,
	navLinks,
	contentClassName,
	sideOffset,
}: {
	MenuIcon: React.ReactNode;
	user: UserDetails | null;
	navLinks?: NavLink[];
	contentClassName?: string;
	sideOffset?: number;
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="size-8 sm:size-9">
					{MenuIcon}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={cn('w-48', contentClassName)}
				align="end"
				alignOffset={-7}
				sideOffset={sideOffset}
			>
				{user !== null && (
					<>
						<NavbarMenuUserCard user={user} />
						<DropdownMenuSeparator />
					</>
				)}

				{navLinks?.length && (
					<>
						<NavbarMenuLinkGroup navLinks={navLinks} />
						<DropdownMenuSeparator />
					</>
				)}

				<NavbarMenuLogInOut loggedIn={user !== null} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function NavbarMenuUserCard({ user }: { user: UserDetails }) {
	return (
		user && (
			<DropdownMenuLabel className="space-y-1">
				<Text>{user.zid}</Text>
				<Text className="italic text-wrap">{user.name}</Text>
			</DropdownMenuLabel>
		)
	);
}

function NavbarMenuLinkGroup({ navLinks }: { navLinks: NavLink[] }) {
	return (
		<DropdownMenuGroup className="space-y-1">
			{navLinks.map((link) => (
				<DropdownMenuItem asChild key={link.label}>
					<Link href={link.href}>
						{link.Icon && <link.Icon className="size-5 stroke-2" />}{' '}
						{link.label}
					</Link>
				</DropdownMenuItem>
			))}
		</DropdownMenuGroup>
	);
}

function NavbarMenuLogInOut({ loggedIn }: { loggedIn: boolean }) {
	const { logOut } = useAuth();

	return (
		<DropdownMenuGroup>
			{loggedIn ? (
				<DropdownMenuItem onSelect={logOut}>
					<LogOutIcon className="size-5" />
					<Text>Log Out</Text>
				</DropdownMenuItem>
			) : (
				<DropdownMenuItem asChild>
					<Link href="/login">
						<LogInIcon className="size-5" />
						<Text>Log In</Text>
					</Link>
				</DropdownMenuItem>
			)}
		</DropdownMenuGroup>
	);
}

////////////////////////////////////////////////////////////////////////////////
