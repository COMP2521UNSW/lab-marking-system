import type { UserRole } from '@/types/users';

function isAdmin(role: UserRole) {
	return role === 'admin';
}

function isTutor(role: UserRole) {
	return role === 'tutor' || role === 'admin';
}

export { isAdmin, isTutor };
