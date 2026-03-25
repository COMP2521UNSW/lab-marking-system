import type { SessionUser } from '@workspace/types/users';

export type BackendService<T> = {
	[K in keyof T]: T[K] extends (...args: infer A) => infer R
		? (user: SessionUser, ...args: A) => R
		: never;
};
