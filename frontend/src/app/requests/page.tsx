'use client';

import { LoginRequired } from '@/components/guards/login-required';
import { useAuth } from '@/components/providers/auth-provider';
import { preloadImage } from '@/components/ui/base/image';
import { isTutor } from '@/lib/roles';

import { StudentRequestsPage } from './_student/student-requests-page';
import { TutorRequestsPage } from './_tutor/tutor-requests-page';

export default function Page() {
	preloadImage('/sleeping.gif');

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
