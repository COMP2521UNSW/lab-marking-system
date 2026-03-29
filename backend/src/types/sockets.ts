import type { Namespace as SocketIONamespace } from 'socket.io';

import type { SerializedSocketEvents } from '@workspace/types/sockets';

export type Namespace<
	ClientToServerEvents extends object,
	ServerToClientEvents extends object,
	ServerSideEvents extends object,
	SocketData,
> = SocketIONamespace<
	SerializedSocketEvents<ClientToServerEvents>,
	ServerToClientEvents,
	SerializedSocketEvents<ServerSideEvents>,
	SocketData
>;
