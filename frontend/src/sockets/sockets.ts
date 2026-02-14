import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type {
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
} from '@/types/socket';

export const studentSocket: Socket<
	StudentServerToClientEvents,
	StudentClientToServerEvents
> = io(`${process.env.NEXT_PUBLIC_SERVER_URL!}/students`, {
	autoConnect: false,
	withCredentials: true,
});

export const tutorSocket: Socket<
	TutorServerToClientEvents,
	TutorClientToServerEvents
> = io(`${process.env.NEXT_PUBLIC_SERVER_URL!}/tutors`, {
	autoConnect: false,
	withCredentials: true,
});
