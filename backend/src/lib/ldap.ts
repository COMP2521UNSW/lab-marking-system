import { Client } from 'ldapts';

const DOMAIN = 'ad.unsw.edu.au';

async function authenticate(zid: string, password: string) {
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
