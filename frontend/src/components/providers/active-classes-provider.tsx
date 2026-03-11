import * as React from 'react';
import { Socket } from 'socket.io-client';

import { ActiveClasses } from '@workspace/types/classes';
import { BaseServerToClientEvents } from '@workspace/types/sockets';

import { SocketContextValue } from './sockets/create';

type ContextValue = {
	activeClasses: ActiveClasses;
};

const ActiveClassesContext = React.createContext<ContextValue | undefined>(
	undefined,
);

export function ActiveClassesProvider({
	useSocket,
	initialActiveClasses,
	children,
}: {
	useSocket: () => SocketContextValue<Socket<BaseServerToClientEvents, object>>;
	initialActiveClasses: ActiveClasses;
	children: React.ReactNode;
}) {
	const { socket } = useSocket();

	const [activeClasses, setActiveClasses] =
		React.useState(initialActiveClasses);

	React.useEffect(() => {
		socket.on('activeClasses', (activeClasses) => {
			setActiveClasses(activeClasses);
		});

		return () => {
			socket.off('activeClasses');
		};
	});

	return (
		<ActiveClassesContext.Provider value={{ activeClasses }}>
			{children}
		</ActiveClassesContext.Provider>
	);
}

export function useActiveClasses() {
	const ctx = React.useContext(ActiveClassesContext);
	if (ctx === undefined) {
		throw new Error(
			'useActiveClasses must be used within <ActiveClassesProvider>',
		);
	}
	return ctx;
}
