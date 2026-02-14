import { rateLimit } from 'express-rate-limit';

const rateLimiter = rateLimit({
	windowMs: 60000,
	limit: 30,
});

export { rateLimiter };
