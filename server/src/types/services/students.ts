import type { ActivityAsTutor } from '@/types/activities';
import type { RequestLogEvent } from '@/types/log';
import type { StudentDetails } from '@/types/users';

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
