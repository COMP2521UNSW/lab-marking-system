import { tutorSocket } from '@/sockets/tutor-socket';

import { createSocketContext } from './create';

const { SocketProvider: TutorSocketProvider, useSocket: useTutorSocket } =
	createSocketContext(tutorSocket);

export { TutorSocketProvider, useTutorSocket };
