import cron from 'node-cron';

import { studentSocket, tutorSocket } from '@/server';
import * as classesService from '@/services/classes';

function registerCronJob() {
	// NOTE: this assumes that classes start at 15-minute boundaries only
	cron.schedule('0,15,30,45 * * * *', async () => {
		const studentClasses = await classesService.getActiveClassesForStudent();
		const tutorClasses = await classesService.getActiveClassesForTutor();

		studentSocket.emit('activeClasses', studentClasses);
		tutorSocket.emit('activeClasses', tutorClasses);
	});
}

export { registerCronJob };
