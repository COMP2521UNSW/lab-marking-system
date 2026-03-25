import type {
	GetStudentLogsRequestData,
	GetStudentLogsResponseData,
	GetStudentMarksRequestData,
	GetStudentMarksResponseData,
	SearchStudentsRequestData,
	SearchStudentsResponseData,
	StudentsService,
} from '@workspace/types/services/students';

import { api } from '@/api/api';

class FrontendStudentsService implements StudentsService {
	async searchStudents(req: SearchStudentsRequestData) {
		const res = await api.get<SearchStudentsResponseData>('/students', {
			params: {
				q: req.q,
			},
		});
		return res.data;
	}

	async getStudentMarks(req: GetStudentMarksRequestData) {
		const res = await api.get<GetStudentMarksResponseData>(
			`/students/${req.zid}/marks`,
		);
		return res.data;
	}

	async getStudentLogs(req: GetStudentLogsRequestData) {
		const res = await api.get<GetStudentLogsResponseData>(
			`/students/${req.zid}/logs`,
		);
		return res.data;
	}
}

const studentsService: StudentsService = new FrontendStudentsService();

export default studentsService;
