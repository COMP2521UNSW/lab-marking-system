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
	if (cachedValue !== undefined) {
		// cache hit
		value = cachedValue;
		recordHit(key);
	} else {
		// cache miss
		value = await fetcher();
		cache.set(key, value, ttl);
		recordMiss(key);
	}

	return value;
}

////////////////////////////////////////////////////////////////////////////////

type Stats = {
	hits: number;
	misses: number;
};

const cacheStats = new Map<string, Stats>();

function recordHit(key: string) {
	updateCache(key, hitUpdateFn);
}

function recordMiss(key: string) {
	updateCache(key, missUpdateFn);
}

function hitUpdateFn(stats: Stats) {
	stats.hits++;
}

function missUpdateFn(stats: Stats) {
	stats.misses++;
}

function updateCache(key: string, updateFn: (stats: Stats) => void) {
	key = key.split(':', 1)[0];

	if (!cacheStats.get(key)) {
		cacheStats.set(key, { hits: 0, misses: 0 });
	}

	updateFn(cacheStats.get(key)!);
}

function getStats() {
	return cacheStats;
}

////////////////////////////////////////////////////////////////////////////////

export { get, getStats };
