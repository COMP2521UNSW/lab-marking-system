export class ApiError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);

		this.name = 'ApiError';
	}
}
