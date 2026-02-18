import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { processToken } from '@/middleware/authentication';
import { errorHandler } from '@/middleware/error-handler';
import { logger } from '@/middleware/logger';
import { rateLimiter } from '@/middleware/rate-limiter';
import { router as activitiesRouter } from '@/routes/activities';
import { router as authRouter } from '@/routes/auth';
import { router as classesRouter } from '@/routes/classes';
import { router as pagesRouter } from '@/routes/pages';
import { router as requestsRouter } from '@/routes/requests';
import { router as studentsRouter } from '@/routes/students';

const clientOrigin = process.env.CLIENT_URL!;

const app = express();

app.set('trust proxy', 1);

app.use(
	cors({
		origin: [clientOrigin],
		credentials: true,
	}),
);

app.use(rateLimiter);

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
