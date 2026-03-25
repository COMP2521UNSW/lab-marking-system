import '@/lib/polyfills/group-by';

import type { ClassesService } from '@workspace/types/services/classes';
import type { SessionUser } from '@workspace/types/users';

import * as dbClasses from '@/db/classes';
import type { BackendService } from '@/types/utils';

import {
	getActiveClassesForStudent,
	getActiveClassesForTutor,
} from './utils/classes';
import { toClassList } from './utils/mappers';

class BackendClassesService implements BackendService<ClassesService> {
	async getAllClasses(user: SessionUser) {
		const classes = await dbClasses.getAllClasses();

		return toClassList(classes);
	}

	async getActiveClasses(user: SessionUser) {
		if (user.role === 'student') {
			return await getActiveClassesForStudent();
		} else {
			return await getActiveClassesForTutor();
		}
	}
}

const classesService: BackendService<ClassesService> =
	new BackendClassesService();

export default classesService;
