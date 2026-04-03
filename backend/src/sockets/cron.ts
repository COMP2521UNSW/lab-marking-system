import cron from 'node-cron';

import { logger } from '@/lib/logger';
import { io, studentSocket, tutorSocket } from '@/server';
import {
	getActiveClassesForStudent,
	getActiveClassesForTutor,
} from '@/services/classes';

function registerCronJob() {
	// NOTE: this assumes that classes start at 15-minute boundaries only
	cron.schedule('0,15,30,45 * * * *', async () => {
		const studentClasses = await getActiveClassesForStudent();
		const tutorClasses = await getActiveClassesForTutor();

		studentSocket.emit('activeClasses', studentClasses);
		tutorSocket.emit('activeClasses', tutorClasses);
	});

	cron.schedule('* * * * *', () => {
		logger.info(`Connected clients: ${io.engine.clientsCount}`);
	});
}

export { registerCronJob };
