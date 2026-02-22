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
} from 'lucide-react';
import * as React from 'react';

import type { SessionUser } from '@workspace/types/users';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/base/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/base/dropdown-menu';
import { Link } from '@/components/ui/base/link';
import { LinkButton } from '@/components/ui/base/link-button';
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

	const loggedIn = user !== null;
	const navLinks = getNavLinks(user);

	return (
		<div
			className={cn(
				'flex justify-between items-center gap-2 h-[40px] sm:h-[50px] min-w-fit rounded-strong border border-outline shadow-regular p-0.5 pe-1.5 bg-card',
				className,
			)}
		>
			<Logo />

			<div>
				{/* Desktop */}
				<div className="hidden sm:flex items-center gap-3">
					{navLinks.length > 0 && <DesktopPagesMenu navLinks={navLinks} />}
					<LogInOutButton loggedIn={loggedIn} />
					<ThemeToggle />
				</div>

				{/* Mobile */}
				<div className="flex items-center gap-1 sm:hidden">
					<ThemeToggle className="size-8 [&_svg]:size-5" />
					<MobileNavMenu loggedIn={loggedIn} navLinks={navLinks} />
				</div>
			</div>
		</div>
	);
}

function getNavLinks(user: SessionUser | null): NavLink[] {
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
					<div className="flex gap-1.5">
						<ChevronDownIcon className="size-6" /> pages
					</div>
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

function MobileNavMenu({
	loggedIn,
	navLinks,
}: {
	loggedIn: boolean;
	navLinks: NavLink[];
}) {
	const { logOut } = useAuth();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="w-10 h-8">
					<MenuIcon className="size-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="block sm:hidden min-w-48"
				align="end"
				alignOffset={-7}
				sideOffset={12}
			>
				{navLinks.length > 0 && (
					<>
						<NavbarMenuLinkGroup navLinks={navLinks} />

						<DropdownMenuSeparator />
					</>
				)}

				<DropdownMenuGroup>
					{loggedIn ? (
						<DropdownMenuItem onSelect={logOut}>
							<LogOutIcon className="size-5 stroke-2" />
							<Text>Log Out</Text>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem asChild>
							<Link href="/login">
								<LogInIcon className="size-5 stroke-2" />
								<Text>Log In</Text>
							</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
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

////////////////////////////////////////////////////////////////////////////////

function LogInOutButton({ loggedIn }: { loggedIn: boolean }) {
	const { logOut } = useAuth();

	return loggedIn ? (
		<Button variant="ghost" className="font-mono font-bold" onClick={logOut}>
			<LogOutIcon className="size-5" /> logout
		</Button>
	) : (
		<LinkButton href="/login" variant="ghost" className="font-mono font-bold">
			<LogInIcon className="size-5" /> login
		</LinkButton>
	);
}

////////////////////////////////////////////////////////////////////////////////
