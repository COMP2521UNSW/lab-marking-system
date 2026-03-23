import type { ActivityAsTutor } from './activities';

export type MarkEntry = {
	activity: ActivityAsTutor;
	mark: number | null;
	markedAt: Date | null;
};
