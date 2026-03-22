import * as React from 'react';

import { ActiveClasses } from '@workspace/types/classes';

import classesService from '@/services/classes';

import { useSocket } from './socket-provider';

type ContextValue = {
	activeClasses: ActiveClasses;
};

const ActiveClassesContext = React.createContext<ContextValue | undefined>(
	undefined,
);

export function ActiveClassesProvider({
	initialActiveClasses,
	children,
}: {
	initialActiveClasses: ActiveClasses;
	children: React.ReactNode;
}) {
	const { socket, addReconnectHandler, removeReconnectHandler } = useSocket();

	const [activeClasses, setActiveClasses] =
		React.useState(initialActiveClasses);

	React.useEffect(() => {
		const handleReconnect = async () => {
			const activeClasses = await classesService.getActiveClasses();
			setActiveClasses(activeClasses);
		};
		addReconnectHandler(handleReconnect);

		socket.on('activeClasses', (activeClasses) => {
			setActiveClasses(activeClasses);
		});

		return () => {
			removeReconnectHandler(handleReconnect);
			socket.off('activeClasses');
		};
	}, [socket, addReconnectHandler, removeReconnectHandler]);

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
