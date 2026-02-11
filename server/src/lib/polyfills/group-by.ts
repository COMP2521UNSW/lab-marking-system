// Polyfills because CSE uses Node v20 which doesn't have Object.groupBy 🙄

declare global {
	interface ObjectConstructor {
		groupBy<T, U extends PropertyKey>(
			items: Iterable<T>,
			callback: (item: T, index: number) => U,
		): Partial<Record<U, T[]>>;
	}

	interface MapConstructor {
		groupBy<T, K>(
			items: Iterable<T>,
			callback: (item: T, index: number) => K,
		): Map<K, T[]>;
	}
}

if (!Object.groupBy) {
	Object.groupBy = <T, U extends PropertyKey>(
		items: Iterable<T>,
		callback: (item: T, index: number) => U,
	): Partial<Record<U, T[]>> => {
		const result: Partial<Record<U, T[]>> = {};

		let i = 0;
		for (const item of items) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const key = callback(item, i++);

			if (result[key]) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				result[key].push(item);
			} else {
				result[key] = [item];
			}
		}

		return result;
	};
}

if (!Map.groupBy) {
	Map.groupBy = <T, K>(
		items: Iterable<T>,
		callback: (item: T, index: number) => K,
	): Map<K, T[]> => {
		const result = new Map<K, T[]>();

		let i = 0;
		for (const item of items) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const key = callback(item, i++);
			const group = result.get(key);

			if (group) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				group.push(item);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				result.set(key, [item]);
			}
		}

		return result;
	};
}

export {};
