import '@/lib/polyfills/group-by';

import { format } from 'date-fns';

import type { ClassDetails } from '@workspace/types/classes';
import type { Time } from '@workspace/types/time';

import { get } from '@/cache/cache';
import * as dbClasses from '@/db/classes';

import { toClassList } from './mappers';
import type { TermDate } from './term';
import { getTermDate, termInProgress } from './term';
import { getDate } from './time';

////////////////////////////////////////////////////////////////////////////////

export async function classIsOpen(classDetails: ClassDetails) {
	const classes = await getActiveClasses();

	return classes.current.some((cls) => cls.code === classDetails.code);
}

export async function getActiveClassesForStudent() {
	const classes = await getActiveClasses();

	// Students can only see current and upcoming classes
	return {
		current: classes.current,
		upcoming: classes.upcoming,
		recent: [],
	};
}

export async function getActiveClassesForTutor() {
	return await getActiveClasses();
}

/**
 * Active classes include current classes, classes which are starting soon
 * (in < 15 minutes) and classes which have ended recently (up to 1 hour ago)
 */
async function getActiveClasses() {
	const date = getDate();

	return await get(
		// we can key by HH:mm because TTL is 1 minute
		`getActiveClasses:${format(date, 'HH:mm')}`,
		() => getActiveClassesByTime(date),
		60,
	);
}

async function getActiveClassesByTime(date: Date) {
	if (!(await termInProgress(date))) {
		return {
			current: [],
			upcoming: [],
			recent: [],
		};
	}

	const classes = await dbClasses.getAllClasses();

	const termDate = await getTermDate(date);

	const groupedClasses = Object.groupBy(classes, (cls) =>
		getClassState(cls, termDate),
	);

	return {
		current: toClassList(groupedClasses.current ?? []),
		upcoming: toClassList(groupedClasses.upcoming ?? []),
		recent: toClassList(groupedClasses.recent ?? []),
	};
}

////////////////////////////////////////////////////////////////////////////////

type ClassState = 'current' | 'upcoming' | 'recent' | 'inactive';

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const MINS_PER_HOUR = 60;
const MINS_PER_DAY = HOURS_PER_DAY * MINS_PER_HOUR;
const MINS_PER_WEEK = DAYS_PER_WEEK * HOURS_PER_DAY * MINS_PER_HOUR;

export function getClassState(classDetails: ClassDetails, termDate: TermDate) {
	const [startMin, endMin] = toMinuteRange(classDetails);

	const openWeeks =
		classDetails.weeks === null //
			? null
			: parseWeeksString(classDetails.weeks);

	const { week, day, time } = termDate;
	const minuteOfWeek = toMinuteOfWeek(day, time);

	const intervals: [number, number, number, ClassState][] = [
		// class is currently running and started this week
		[startMin, endMin, 0, 'current'],
		// class is currently running and started last week
		[startMin - MINS_PER_WEEK, endMin - MINS_PER_WEEK, -1, 'current'],
		// class starts soon and starts this week
		[startMin - 15, startMin, 0, 'upcoming'],
		// class starts soon and starts next week
		[startMin + MINS_PER_WEEK - 15, startMin + MINS_PER_WEEK, 1, 'upcoming'],
		// class ended recently and ended this week
		[endMin, endMin + 60, 0, 'recent'],
		// class ended recently and ended last week
		[endMin - MINS_PER_WEEK, endMin - MINS_PER_WEEK + 60, -1, 'recent'],
	];

	for (const [start, end, weekAdjust, state] of intervals) {
		if (minuteOfWeek >= start && minuteOfWeek < end) {
			if (openWeeks === null || isOpenInWeek(openWeeks, week + weekAdjust)) {
				return state;
			}
		}
	}

	return 'inactive';
}

function toMinuteRange(classDetails: ClassDetails) {
	const {
		dayOfWeek: day,
		labStartTime: startTime,
		labEndTime: endTime,
	} = classDetails;

	return [
		toMinuteOfWeek(day, startTime),
		toMinuteOfWeek(startTime <= endTime ? day : day + 1, endTime),
	];
}

function toMinuteOfWeek(day: number, time: Time) {
	const [hour, minute] = time.split(':').map(Number);
	return (day - 1) * MINS_PER_DAY + hour * MINS_PER_HOUR + minute;
}

export function parseWeeksString(weeks: string) {
	return weeks
		.split(',')
		.filter((s) => /^(\d+|\d+-\d+)$/.test(s))
		.map((s) => (s.includes('-') ? s.split('-').map(Number) : [Number(s)]));
}

function isOpenInWeek(openWeeks: number[][], week: number) {
	for (const exactWeekOrRange of openWeeks) {
		if (exactWeekOrRange.length === 1) {
			if (week === exactWeekOrRange[0]) {
				return true;
			}
		} else if (week >= exactWeekOrRange[0] && week <= exactWeekOrRange[1]) {
			return true;
		}
	}
	return false;
}
