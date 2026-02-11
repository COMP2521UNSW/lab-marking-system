import NodeCache from 'node-cache';

const TTL_SECONDS = 86400; // 1 day

const cache = new NodeCache({ stdTTL: TTL_SECONDS });

async function get<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttl: number = TTL_SECONDS,
) {
	const cachedValue: T | undefined = cache.get(key);

	let value: T;
	if (cachedValue === undefined) {
		console.log(`cache miss: ${key}`);
		value = await fetcher();
		cache.set(key, value, ttl);
	} else {
		console.log(`cache hit: ${key}`);
		value = cachedValue;
	}

	return value;
}

export { get };
