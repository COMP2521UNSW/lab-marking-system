import type { RequestHandler } from 'express';
import z from 'zod';

import * as studentsService from '@/services/students';

////////////////////////////////////////////////////////////////////////////////

const searchStudentsSchema = z
	.object({
		query: z.object({
			q: z.string(),
		}),
	})
	.transform((data) => data.query);

const searchStudents: RequestHandler = async (req, res) => {
	const reqData = searchStudentsSchema.parse(req);
	const students = await studentsService.searchStudents(req.user, reqData);
	res.status(200).json(students);
};

////////////////////////////////////////////////////////////////////////////////

const getStudentMarksSchema = z
	.object({
		params: z.object({
			zid: z.string(),
		}),
	})
	.transform((data) => data.params);

const getStudentMarks: RequestHandler = async (req, res) => {
	const reqData = getStudentMarksSchema.parse(req);
	const marks = await studentsService.getStudentMarks(req.user, reqData);
	res.status(200).json(marks);
};

////////////////////////////////////////////////////////////////////////////////

const getStudentLogsSchema = z
	.object({
		params: z.object({
			zid: z.string(),
		}),
	})
	.transform((data) => data.params);

const getStudentLogs: RequestHandler = async (req, res) => {
	const reqData = getStudentLogsSchema.parse(req);
	const logs = await studentsService.getStudentLogs(req.user, reqData);
	res.status(200).json(logs);
};

////////////////////////////////////////////////////////////////////////////////

export { getStudentLogs, getStudentMarks, searchStudents };
