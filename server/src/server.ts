import { createServer as createHttpServer } from 'node:http';

import { app } from './app';
import { createServer as createIOServer } from './io';

const server = createHttpServer(app);

const { studentSocket, tutorSocket } = createIOServer(server);

export { server, studentSocket, tutorSocket };
