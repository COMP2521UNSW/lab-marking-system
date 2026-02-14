import * as dbLog from '@/db/log';
import * as dbMarks from '@/db/marks';
import * as dbStudents from '@/db/users';
import { BadRequestError } from '@/lib/errors';
import type { RequestLogEvent } from '@/types/log';
import type {
	GetStudentLogsRequestData,
	GetStudentLogsResponseData,
	GetStudentMarksRequestData,
	GetStudentMarksResponseData,
	SearchStudentsRequestData,
	SearchStudentsResponseData,
} from '@/types/services/students';
import type { SessionUser } from '@/types/users';

////////////////////////////////////////////////////////////////////////////////

export async function searchStudents(
	user: SessionUser,
	req: SearchStudentsRequestData,
): Promise<SearchStudentsResponseData> {
	req = validateSearchStudents(user, req);

	return await dbStudents.searchStudents(req.q);
}

function validateSearchStudents(
	user: SessionUser,
	req: SearchStudentsRequestData,
) {
	req.q = req.q.trim();

	if (req.q.length < 2) {
		throw new BadRequestError('Query must contain at least 2 characters');
	}

	return req;
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentMarks(
	user: SessionUser,
	req: GetStudentMarksRequestData,
): Promise<GetStudentMarksResponseData> {
	return await dbMarks.getStudentMarks(req.zid);
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentLogs(
	user: SessionUser,
	req: GetStudentLogsRequestData,
): Promise<GetStudentLogsResponseData> {
	const logs = await dbLog.getStudentLogs(req.zid);

	// logs are expected to satisfy the RequestLogEvent union type
	return logs as RequestLogEvent[];
}

////////////////////////////////////////////////////////////////////////////////
