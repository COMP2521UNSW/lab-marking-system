import 'dotenv/config';

import { createServer } from 'node:http';

import { createProxyServer } from 'http-proxy';
import waitOn from 'wait-on';

async function main() {
	const backendUrl = `http://localhost:${process.env.BACKEND_PORT}`;
	const frontendUrl = `http://localhost:${process.env.FRONTEND_PORT}`;

	try {
		await waitOn({
			resources: [`${backendUrl}/user`, frontendUrl],
			delay: 3000,
			interval: 1000,
			simultaneous: 2,
			timeout: 30000,
		});
	} catch (err) {
		console.error(err instanceof Error ? err.message : JSON.stringify(err));
		console.error('Exiting...');
		process.exit(1);
	}

	const proxy = createProxyServer({ ws: true });

	const server = createServer((req, res) => {
		const url = req.url!;

		if (url.startsWith('/api/')) {
			req.url = url.replace(/^\/api/, '');
			proxy.web(req, res, { target: backendUrl });
		} else {
			proxy.web(req, res, { target: frontendUrl });
		}
	});

	// WebSockets
	server.on('upgrade', (req, socket, head) => {
		const url = req.url!;

		if (url.startsWith('/api/')) {
			req.url = url.replace(/^\/api/, '');
			proxy.ws(req, socket, head, { target: backendUrl });
		} else {
			proxy.ws(req, socket, head, { target: frontendUrl });
		}
	});

	server.on('error', (err) => {
		console.log('Error!!!!!');
		console.error(err);
	});

	const proxyPort = Number(process.env.PROXY_PORT!);
	server.listen(proxyPort, () => {
		console.log(`Proxy server running on port ${proxyPort}`);
	});
}

void main();
