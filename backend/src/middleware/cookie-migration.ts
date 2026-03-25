import type { Request, RequestHandler } from 'express';
import { UAParser } from 'ua-parser-js';

const clearOldCookie: RequestHandler = (req, res, next) => {
	if (canClearCookie(req)) {
		res.clearCookie('token', {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			partitioned: true,
		});
	}
	next();
};

function canClearCookie(req: Request) {
	const userAgent = req.headers['user-agent'];
	const { browser } = UAParser(userAgent);
	const name = browser.name;

	if (name === undefined) {
		console.log(`warn: failed to parse browser (${userAgent})`);
		return true;
	} else if (name.includes('Safari')) {
		return false;
	} else if (name.includes('Firefox') && browser.version === '140.0') {
		return false;
	} else {
		return true;
	}
}

export { clearOldCookie };
