import 'dotenv/config';

import { server } from './server';

import './cron';

const serverPort = Number(process.env.PORT!);
server.listen(serverPort, () => {
	console.log(`Server running on port ${serverPort}`);
});
