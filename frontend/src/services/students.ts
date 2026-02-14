import { api } from '@/api/api';
import type {
	GetStudentLogsRequestData,
	GetStudentLogsResponseData,
	GetStudentMarksRequestData,
	GetStudentMarksResponseData,
	SearchStudentsRequestData,
	SearchStudentsResponseData,
} from '@/types/services/students';

////////////////////////////////////////////////////////////////////////////////

export async function searchStudents(req: SearchStudentsRequestData) {
	const res = await api.get<SearchStudentsResponseData>('/students', {
		params: {
			q: req.q,
		},
	});
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentMarks(req: GetStudentMarksRequestData) {
	const res = await api.get<GetStudentMarksResponseData>(
		`/students/${req.zid}/marks`,
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function getStudentLogs(req: GetStudentLogsRequestData) {
	const res = await api.get<GetStudentLogsResponseData>(
		`/students/${req.zid}/logs`,
	);
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////
