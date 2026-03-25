type LogLevel = 'info' | 'warn' | 'error';

type ErrorOptions = {
	logLevel?: LogLevel;
};

class BadRequestError extends Error {
	logLevel: LogLevel;

	constructor(message: string, options?: ErrorOptions) {
		super(message);
		this.name = 'BadRequestError';
		this.logLevel = options?.logLevel ?? 'warn';
	}
}

class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

class ForbiddenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ForbiddenError';
	}
}

class InternalServerError extends Error {
	logLevel: LogLevel;

	constructor(message: string, options?: ErrorOptions) {
		super(message);
		this.name = 'InternalServerError';
		this.logLevel = options?.logLevel ?? 'error';
	}
}

export {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
};
