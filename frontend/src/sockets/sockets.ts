import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type {
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
} from '@workspace/types/sockets';

const url = new URL('socket.io', `${process.env.NEXT_PUBLIC_SERVER_URL!}/`);

export const studentSocket: Socket<
	StudentServerToClientEvents,
	StudentClientToServerEvents
> = io(`${url.origin}/students`, {
	path: url.pathname,
	autoConnect: false,
	withCredentials: true,
});

export const tutorSocket: Socket<
	TutorServerToClientEvents,
	TutorClientToServerEvents
> = io(`${url.origin}/tutors`, {
	path: url.pathname,
	autoConnect: false,
	withCredentials: true,
});
