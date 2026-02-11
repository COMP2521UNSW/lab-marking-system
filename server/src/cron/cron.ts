import cron from 'node-cron';

import { studentSocket, tutorSocket } from '@/server';
import * as classesService from '@/services/classes';

// NOTE: this assumes that classes start at 15-minute boundaries only
cron.schedule('0,15,30,45 * * * *', async () => {
	console.log(`[${new Date().toString()}] started job`);

	const studentClasses = await classesService.getActiveClassesForStudent();
	const tutorClasses = await classesService.getActiveClassesForTutor();

	studentSocket.emit('activeClasses', studentClasses);
	tutorSocket.emit('activeClasses', tutorClasses);

	console.log(`[${new Date().toString()}] finished job`);
});
