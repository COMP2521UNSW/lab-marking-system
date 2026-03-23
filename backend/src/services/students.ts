import type {
	GetStudentLogsRequestData,
	GetStudentMarksRequestData,
	SearchStudentsRequestData,
	StudentsService,
} from '@workspace/types/services/students';
import type { SessionUser } from '@workspace/types/users';

import * as dbLogs from '@/db/logs';
import * as dbMarks from '@/db/marks';
import * as dbStudents from '@/db/users';
import { BadRequestError } from '@/lib/errors';
import type { BackendService } from '@/types/utils';

import {
	toLogEventList,
	toMarkEntryList,
	toStudentDetailsList,
} from './utils/mappers';

class BackendStudentsService implements BackendService<StudentsService> {
	//////////////////////////////////////////////////////////////////////////////

	async searchStudents(user: SessionUser, req: SearchStudentsRequestData) {
		req = this.validateSearchStudents(req);

		const students = await dbStudents.searchStudents(req.q);

		return toStudentDetailsList(students);
	}

	private validateSearchStudents(req: SearchStudentsRequestData) {
		req.q = req.q.trim();

		if (req.q.length < 2) {
			throw new BadRequestError('Query must contain at least 2 characters');
		}

		return req;
	}

	//////////////////////////////////////////////////////////////////////////////

	async getStudentMarks(user: SessionUser, req: GetStudentMarksRequestData) {
		const markEntries = await dbMarks.getStudentMarks(req.zid);

		return toMarkEntryList(markEntries);
	}

	//////////////////////////////////////////////////////////////////////////////

	async getStudentLogs(user: SessionUser, req: GetStudentLogsRequestData) {
		const logs = await dbLogs.getStudentLogs(req.zid);

		return toLogEventList(logs);
	}

	//////////////////////////////////////////////////////////////////////////////
}

const studentsService: BackendService<StudentsService> =
	new BackendStudentsService();

export default studentsService;
