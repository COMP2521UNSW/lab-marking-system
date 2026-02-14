import 'dotenv/config';

import { server } from './server';

import './cron/cron';

const serverPort = Number(process.env.SERVER_PORT!);
server.listen(serverPort, () => {
	console.log(`Server running on port ${serverPort}`);
});
