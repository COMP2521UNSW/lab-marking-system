import * as React from 'react';
import type { Socket } from 'socket.io-client';

export type SocketContextValue<T> = {
	socket: T;
};

function createSocketContext<T extends Socket>(socket: T) {
	const SocketContext = React.createContext<SocketContextValue<T> | undefined>(
		undefined,
	);

	const SocketProvider = ({ children }: { children: React.ReactNode }) => {
		React.useEffect(() => {
			socket.connect();

			return () => {
				socket.disconnect();
			};
		}, []);

		return (
			<SocketContext.Provider value={{ socket }}>
				{children}
			</SocketContext.Provider>
		);
	};

	const useSocket = () => {
		const ctx = React.useContext(SocketContext);
		if (ctx === undefined) {
			throw new Error('useSocket must be used within <SocketProvider>');
		}
		return ctx;
	};

	return { SocketProvider, useSocket };
}

export { createSocketContext };
