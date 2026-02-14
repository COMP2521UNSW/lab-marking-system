import axios from 'axios';

import { delay } from '@/lib/delay';
import { ApiError } from '@/lib/errors';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

api.interceptors.request.use(async (config) => {
	// introduce synthetic delay in development mode
	if (process.env.NODE_ENV === 'development') {
		await delay(500);
	}
	config.withCredentials = true;
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		const message =
			err.response?.data?.message || 'Something went wrong, please try again';
		throw new ApiError(message);
	},
);

export { api };
