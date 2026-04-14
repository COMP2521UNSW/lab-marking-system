import type { Server as HTTPServer } from 'node:http';

import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import type {
	SocketData,
	StudentClientToServerEvents,
	StudentServerToClientEvents,
	TutorClientToServerEvents,
	TutorServerToClientEvents,
} from '@workspace/types/sockets';
import type { SessionUser } from '@workspace/types/users';
import type { EmptyObject } from '@workspace/types/utils';

import { logger } from '@/lib/logger';
import type { Namespace } from '@/types/sockets';

type SocketIOMiddleware = Parameters<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Server<any, any, any, SocketData>['use']
>[number];

function createServer(httpServer: HTTPServer) {
	const io = new Server<EmptyObject, EmptyObject, EmptyObject, SocketData>(
		httpServer,
		{
			connectionStateRecovery: {
				maxDisconnectionDuration: 2 * 60 * 1000,
				skipMiddlewares: true,
			},
		},
	);

	const readToken: SocketIOMiddleware = (socket, next) => {
		try {
			const cookies = cookie.parseCookie(socket.handshake.headers.cookie ?? '');
			const payload = jwt.verify(
				cookies['token'] ?? '',
				process.env.JWT_SECRET!,
			);

			// payload is guaranteed to satisfy SessionUser due to logIn() in
			// src/controllers/auth.ts
			socket.data.user = payload as SessionUser;
		} catch (err) {
			if (err instanceof Error) {
				logger.warn(`${err.name}: ${err.message}`);
			} else {
				logger.warn(JSON.stringify(err));
			}
			return;
		}

		next();
	};

	const studentNamespace: Namespace<
		StudentClientToServerEvents,
		StudentServerToClientEvents,
		EmptyObject,
		SocketData
	> = io.of('/students');

	studentNamespace.use(readToken);

	studentNamespace.on('connection', (socket) => {
		const user = socket.data.user;
		logger.info(`(${socket.id}) Student connected`, { user });

		void socket.join(user.zid);

		socket.on('disconnect', () => {
			logger.info(`(${socket.id}) Student disconnected`, { user });
		});
	});

	const tutorNamespace: Namespace<
		TutorClientToServerEvents,
		TutorServerToClientEvents,
		EmptyObject,
		SocketData
	> = io.of('/tutors');

	tutorNamespace.use(readToken);
	tutorNamespace.use((socket, next) => {
		if (socket.data.user.role === 'student') {
			return;
		}
		next();
	});

	tutorNamespace.on('connection', (socket) => {
		const user = socket.data.user;
		logger.info(`(${socket.id}) Tutor connected`, { user });

		socket.on('viewClass', (classCode) => {
			if (user.role === 'student') return;

			logger.info(`(${socket.id}) Tutor viewing class ${classCode}`, { user });
			socket.rooms.forEach((room) => {
				if (room !== socket.id) {
					void socket.leave(room);
				}
			});
			void socket.join(classCode);
		});

		socket.on('disconnect', () => {
			logger.info(`(${socket.id}) Tutor disconnected`, { user });
		});
	});

	return { io, studentSocket: studentNamespace, tutorSocket: tutorNamespace };
}

export { createServer };
