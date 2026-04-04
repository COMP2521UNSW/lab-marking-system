import axios from 'axios';
import { Temporal } from 'temporal-polyfill';

import { delay } from '@/lib/delay';
import { ApiError } from '@/lib/errors';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const dateReviver = (key: PropertyKey, value: unknown) => {
	if (typeof value === 'string' && isoDateRegex.test(value)) {
		return Temporal.Instant.from(value);
	}
	return value;
};

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	transformResponse: [
		(data) => {
			try {
				return JSON.parse(data, dateReviver);
			} catch {
				return data;
			}
		},
	],
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
