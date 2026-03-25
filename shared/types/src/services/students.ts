import type { LogEvent } from '../logs';
import type { MarkEntry } from '../marks';
import type { StudentDetails } from '../users';

////////////////////////////////////////////////////////////////////////////////

export interface StudentsService {
	searchStudents(
		req: SearchStudentsRequestData,
	): Promise<SearchStudentsResponseData>;

	getStudentMarks(
		req: GetStudentMarksRequestData,
	): Promise<GetStudentMarksResponseData>;

	getStudentLogs(
		req: GetStudentLogsRequestData,
	): Promise<GetStudentLogsResponseData>;
}

////////////////////////////////////////////////////////////////////////////////

export type SearchStudentsRequestData = {
	q: string;
};

export type SearchStudentsResponseData = StudentDetails[];

export type GetStudentMarksRequestData = {
	zid: string;
};

export type GetStudentMarksResponseData = MarkEntry[];

export type GetStudentLogsRequestData = {
	zid: string;
};

export type GetStudentLogsResponseData = LogEvent[];
