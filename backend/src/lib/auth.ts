import { Client } from 'ldapts';

const DOMAIN = 'ad.unsw.edu.au';

async function authenticate(zid: string, password: string) {
	// If UNSW_AUTH_URL is set, then it is assumed that the server is deployed
	// externally (i.e., outside UNSW)
	if (process.env.UNSW_AUTH_URL) {
		return await externalAuthenticate(zid, password);
	} else {
		return await internalAuthenticate(zid, password);
	}
}

/**
 * Authenticate users from outside UNSW systems
 */
async function externalAuthenticate(zid: string, password: string) {
	try {
		const response = await fetch(process.env.UNSW_AUTH_URL!, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ zid, zpass: password }),
		});

		if (!response.ok) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Authenticate users from within UNSW systems
 */
async function internalAuthenticate(zid: string, password: string) {
	const client = new Client({
		url: `ldaps://${DOMAIN}`,
	});

	try {
		await client.bind(`${zid}@${DOMAIN}`, password);
		return true;
	} catch {
		return false;
	} finally {
		await client.unbind();
	}
}

export { authenticate };
