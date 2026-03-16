import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type {
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
} from '@workspace/types/sockets';

const { uri, path } = getSocketUriAndPath();

export const studentSocket: Socket<
	StudentServerToClientEvents,
	StudentClientToServerEvents
> = io(`${uri}/students`, {
	path,
	autoConnect: false,
	withCredentials: true,
});

export const tutorSocket: Socket<
	TutorServerToClientEvents,
	TutorClientToServerEvents
> = io(`${uri}/tutors`, {
	path,
	autoConnect: false,
	withCredentials: true,
});

////////////////////////////////////////////////////////////////////////////////

function getSocketUriAndPath() {
	const serverPath = process.env.NEXT_PUBLIC_SERVER_URL!;

	if (serverPath.startsWith('/')) {
		return {
			uri: '',
			path: `${serverPath}/socket.io`,
		};
	} else {
		const url = new URL('socket.io', `${serverPath}/`);
		return {
			uri: url.origin,
			path: url.pathname,
		};
	}
}

////////////////////////////////////////////////////////////////////////////////
