import cron from 'node-cron';

import { TIME_ZONE } from '@/lib/date';
import { logger } from '@/lib/logger';

import { getStats } from './cache';

function registerCronJob() {
	cron.schedule(
		'0 0 * * *',
		() => {
			const stats = getStats();

			const summary = Object.fromEntries(
				Array.from(stats.entries()).map(([key, { hits: h, misses: m }]) => [
					key,
					`${h}/${h + m} (${((100 * h) / (h + m)).toFixed(2)}%)`,
				]),
			);

			logger.info(`Cache hit rates: ${JSON.stringify(summary)}`);
		},
		{
			timezone: TIME_ZONE,
		},
	);
}

export { registerCronJob };
