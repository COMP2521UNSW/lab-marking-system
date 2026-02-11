export type UserRole = 'student' | 'tutor' | 'admin';

export type SessionUser = {
	zid: string;
	role: UserRole;
};

export type User = {
	zid: string;
	name: string;
};

export type Student = User;

export type StudentDetails = {
	zid: string;
	name: string;
	classCode: string;
};
