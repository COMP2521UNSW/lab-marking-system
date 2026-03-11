import { studentSocket } from '@/sockets/student-socket';

import { createSocketContext } from './create';

const { SocketProvider: StudentSocketProvider, useSocket: useStudentSocket } =
	createSocketContext(studentSocket);

export { StudentSocketProvider, useStudentSocket };
