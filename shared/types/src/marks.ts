import type { Temporal } from 'temporal-polyfill';

import type { ActivityAsTutor } from './activities';

export type MarkEntry = {
	activity: ActivityAsTutor;
	mark: number | null;
	markedAt: Temporal.Instant | null;
};
