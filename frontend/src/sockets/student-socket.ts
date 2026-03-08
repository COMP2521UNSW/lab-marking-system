import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type {
	StudentClientToServerEvents,
	StudentServerToClientEvents,
} from '@workspace/types/sockets';

export const studentSocket: Socket<
	StudentServerToClientEvents,
	StudentClientToServerEvents
> = io(`${process.env.NEXT_PUBLIC_SERVER_URL!}/students`, {
	autoConnect: false,
	withCredentials: true,
});
