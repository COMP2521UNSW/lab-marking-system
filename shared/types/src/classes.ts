import type { Time } from './time';

export type Class = {
	code: string;
	labLocation: string;
};

export type ClassDetails = {
	code: string;
	dayOfWeek: number;
	labStartTime: Time;
	labEndTime: Time;
	labLocation: string;
	weeks: string | null;
};

export type ActiveClasses = {
	current: Class[];
	upcoming: Class[];
	recent: Class[];
};
