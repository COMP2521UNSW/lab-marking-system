class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BadRequestError';
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
	constructor(message: string) {
		super(message);
		this.name = 'InternalServerError';
	}
}

export {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
};
