'use client';

import * as React from 'react';

import { isAdmin, isTutor } from '@workspace/lib/roles';
import type { UserRole } from '@workspace/types/users';

import { useAuth } from '@/components/providers/auth-provider';
import { Forbidden } from '@/components/ui/forbidden/forbidden';

export function RoleRequired({
	roleChecker,
	children,
}: {
	roleChecker: (role: UserRole) => boolean;
	children: React.ReactNode;
}) {
	const { user } = useAuth();

	return user === null || !roleChecker(user.role) ? <Forbidden /> : children;
}

export function TutorRequired({ children }: { children: React.ReactNode }) {
	return <RoleRequired roleChecker={isTutor}>{children}</RoleRequired>;
}

export function AdminRequired({ children }: { children: React.ReactNode }) {
	return <RoleRequired roleChecker={isAdmin}>{children}</RoleRequired>;
}
