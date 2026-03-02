import type { ActivityAsTutor } from '../activities';
import type { RequestLogEvent } from '../logs';
import type { StudentDetails } from '../users';

export type SearchStudentsRequestData = {
	q: string;
};

export type SearchStudentsResponseData = StudentDetails[];

export type GetStudentMarksRequestData = {
	zid: string;
};

export type GetStudentMarksResponseData = {
	activity: ActivityAsTutor;
	mark: number | null;
	markedAt: Date | null;
}[];

export type GetStudentLogsRequestData = {
	zid: string;
};

export type GetStudentLogsResponseData = RequestLogEvent[];
