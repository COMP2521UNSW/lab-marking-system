import * as React from 'react';
import { Socket } from 'socket.io-client';

import { BaseServerToClientEvents } from '@workspace/types/sockets';

import { dismiss, toast } from '@/components/ui/base/toast';
import { studentSocket, tutorSocket } from '@/sockets/sockets';

type ReconnectCallback = () => Promise<void>;

export type SocketContextValue = {
	socket: typeof studentSocket | typeof tutorSocket;
	addReconnectHandler: (callback: ReconnectCallback) => void;
	removeReconnectHandler: (callback: ReconnectCallback) => void;
};

const SocketContext = React.createContext<SocketContextValue | undefined>(
	undefined,
);

function SocketProvider({
	socket,
	children,
}: {
	socket: typeof studentSocket | typeof tutorSocket;
	children?: React.ReactNode;
}) {
	const reconnectingRef = React.useRef<boolean>(false);
	const toastIdRef = React.useRef<number | string | undefined>(undefined);
	const reconnectHandlersRef = React.useRef<ReconnectCallback[]>([]);

	const clearToast = React.useCallback(() => {
		if (toastIdRef.current !== undefined) {
			dismiss(toastIdRef.current);
			toastIdRef.current = undefined;
		}
	}, []);

	React.useEffect(() => {
		socket.connect();

		const handleReconnectAttempt = () => {
			if (!reconnectingRef.current) {
				reconnectingRef.current = true;
				clearToast();
				toastIdRef.current = toast('Reconnecting, please wait...', {
					duration: Infinity,
				});
			}
		};
		socket.io.on('reconnect_attempt', handleReconnectAttempt);

		const handleReconnect = async () => {
			if (!socket.recovered) {
				await Promise.all(reconnectHandlersRef.current.map((fn) => fn()));
			}
			reconnectingRef.current = false;
			clearToast();
			toastIdRef.current = toast('Reconnected', { duration: 2000 });
		};
		socket.io.on('reconnect', handleReconnect);

		return () => {
			clearToast();
			socket.io.off('reconnect_attempt', handleReconnectAttempt);
			socket.io.off('reconnect', handleReconnect);
			socket.disconnect();
		};
	}, [socket, clearToast]);

	const addReconnectHandler = React.useCallback(
		(callback: ReconnectCallback) => {
			reconnectHandlersRef.current.push(callback);
		},
		[],
	);

	const removeReconnectHandler = React.useCallback(
		(callback: ReconnectCallback) => {
			const index = reconnectHandlersRef.current.findIndex(
				(fn) => fn === callback,
			);
			if (index !== -1) {
				reconnectHandlersRef.current.splice(index, 1);
			}
		},
		[],
	);

	return (
		<SocketContext.Provider
			value={{ socket, addReconnectHandler, removeReconnectHandler }}
		>
			{children}
		</SocketContext.Provider>
	);
}

function useSocket() {
	const ctx = React.useContext(SocketContext);
	if (ctx === undefined) {
		throw new Error('useSocket must be used within <SocketProvider>');
	}

	const { socket, ...rest } = ctx;
	return {
		socket: socket as Socket<BaseServerToClientEvents, object>,
		...rest,
	};
}

////////////////////////////////////////////////////////////////////////////////

function StudentSocketProvider({ children }: { children?: React.ReactNode }) {
	return <SocketProvider socket={studentSocket}>{children}</SocketProvider>;
}

function useStudentSocket() {
	const { socket, ...ctx } = useSocket();
	return { socket: socket as typeof studentSocket, ...ctx };
}

////////////////////////////////////////////////////////////////////////////////

function TutorSocketProvider({ children }: { children?: React.ReactNode }) {
	return <SocketProvider socket={tutorSocket}>{children}</SocketProvider>;
}

function useTutorSocket() {
	const { socket, ...ctx } = useSocket();
	return { socket: socket as typeof tutorSocket, ...ctx };
}

////////////////////////////////////////////////////////////////////////////////

export {
	useSocket,
	StudentSocketProvider,
	useStudentSocket,
	TutorSocketProvider,
	useTutorSocket,
};
