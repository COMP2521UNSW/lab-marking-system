import type { Socket as SocketIOClientSocket } from 'socket.io-client';

import type { SerializedSocketEvents } from '@workspace/types/sockets';

export type Socket<
	ServerToClientEvents extends object,
	ClientToServerEvents extends object,
> = SocketIOClientSocket<
	SerializedSocketEvents<ServerToClientEvents>,
	ClientToServerEvents
>;
