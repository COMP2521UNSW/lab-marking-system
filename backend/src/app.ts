import cookieParser from 'cookie-parser';
import express from 'express';
import { UAParser } from 'ua-parser-js';

import { devMode } from '@/lib/utils';
import { processToken } from '@/middleware/authentication';
import { errorHandler } from '@/middleware/error-handler';
import { logger } from '@/middleware/logger';
// import { rateLimiter } from '@/middleware/rate-limiter';
import { router as activitiesRouter } from '@/routes/activities';
import { router as authRouter } from '@/routes/auth';
import { router as classesRouter } from '@/routes/classes';
import { router as pagesRouter } from '@/routes/pages';
import { router as requestsRouter } from '@/routes/requests';
import { router as studentsRouter } from '@/routes/students';

const app = express();

// app.use(rateLimiter);

// temporary middleware to clear out old cookies
app.use((req, res, next) => {
	const { browser } = UAParser(req.headers['user-agent']);
	if (!browser.name?.includes('Safari')) {
		res.clearCookie('token', {
			httpOnly: true,
			secure: !devMode(),
			sameSite: 'none',
			partitioned: true,
		});
	} else {
		console.log(browser);
	}
	next();
});

app.use(express.json());
app.use(cookieParser());

app.use(processToken);

app.use(logger);

app.use('/', activitiesRouter);
app.use('/', authRouter);
app.use('/', classesRouter);
app.use('/', pagesRouter);
app.use('/', requestsRouter);
app.use('/', studentsRouter);

app.use(errorHandler);

export { app };
