import express from 'express';

import * as studentsController from '@/controllers/students';
import { requireLogin } from '@/middleware/authentication';
import { requireTutor } from '@/middleware/authorisation';

const router = express.Router();

router.get(
	'/students', //
	requireLogin,
	requireTutor,
	studentsController.searchStudents,
);

router.get(
	'/students/:zid/marks', //
	requireLogin,
	requireTutor,
	studentsController.getStudentMarks,
);

router.get(
	'/students/:zid/logs', //
	requireLogin,
	requireTutor,
	studentsController.getStudentLogs,
);

export { router };
