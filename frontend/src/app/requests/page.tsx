'use client';

import { LoginRequired } from '@/components/guards/login-required';
import { useAuth } from '@/components/providers/auth-provider';
import { isTutor } from '@/lib/roles';

import { StudentRequestsPage } from './_student/student-requests-page';
import { TutorRequestsPage } from './_tutor/tutor-requests-page';

export default function Page() {
	const { user } = useAuth();

	return (
		<LoginRequired>
			{user === null ? null : isTutor(user.role) ? ( //
				<TutorRequestsPage />
			) : (
				<StudentRequestsPage />
			)}
		</LoginRequired>
	);
}
