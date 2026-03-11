import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type {
	TutorClientToServerEvents,
	TutorServerToClientEvents,
} from '@workspace/types/sockets';

export const tutorSocket: Socket<
	TutorServerToClientEvents,
	TutorClientToServerEvents
> = io(`${process.env.NEXT_PUBLIC_SERVER_URL!}/tutors`, {
	autoConnect: false,
	withCredentials: true,
});
