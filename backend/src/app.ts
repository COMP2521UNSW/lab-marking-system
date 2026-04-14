import cookieParser from 'cookie-parser';
import express from 'express';

import { parseToken } from '@/middleware/authentication';
import { errorHandler } from '@/middleware/error-handler';
import { logger } from '@/middleware/logging';
// import { rateLimiter } from '@/middleware/rate-limiter';
import { router as activitiesRouter } from '@/routes/activities';
import { router as authRouter } from '@/routes/auth';
import { router as classesRouter } from '@/routes/classes';
import { router as debugRouter } from '@/routes/debug';
import { router as pagesRouter } from '@/routes/pages';
import { router as requestsRouter } from '@/routes/requests';
import { router as studentsRouter } from '@/routes/students';

const app = express();

// app.use(rateLimiter);

app.use(express.json());
app.use(cookieParser());

app.use(parseToken);

app.use(logger);

app.use('/', activitiesRouter);
app.use('/', authRouter);
app.use('/', classesRouter);
app.use('/', debugRouter);
app.use('/', pagesRouter);
app.use('/', requestsRouter);
app.use('/', studentsRouter);

app.use(errorHandler);

export { app };
