import { createServer as createHTTPServer } from 'node:http';

import { app } from './app';
import { createServer as createIOServer } from './io';

const server = createHTTPServer(app);

const { studentSocket, tutorSocket } = createIOServer(server);

export { server, studentSocket, tutorSocket };
