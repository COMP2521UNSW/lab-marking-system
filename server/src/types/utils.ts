export type EmptyObject = Record<PropertyKey, never>;

export type Expand<T> = { [K in keyof T]: T[K] } & {};

export type NonNullableKeys<T, K extends keyof T> = Expand<
	_NonNullableKeys<T, K>
>;

type _NonNullableKeys<T, K extends keyof T> = Omit<T, K> & {
	[P in K]-?: NonNullable<T[P]>;
};
