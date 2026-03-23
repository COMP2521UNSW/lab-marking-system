import { expect, test } from '@jest/globals';

import type { ClassDetails } from '@workspace/types/classes';

import { getClassState } from '@/services/classes';

function toMinuteOfWeek(day: number, hour: number, minute: number) {
	return 24 * 60 * (day - 1) + 60 * hour + minute;
}

test('current class - middle of class', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 14, 0);
	expect(getClassState(classDetails, 5, minuteOfWeek)).toEqual('current');
});

test('current class - class just started', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 13, 0);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('current');
});

test('current class - class is about to end', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 14, 59);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('current');
});

test('upcoming class - class starts in 15 minutes', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 12, 45);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('upcoming');
});

test('upcoming class - class is about to open', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 12, 59);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('upcoming');
});

test('recent class - class just ended', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 15, 0);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('recent');
});

test('recent class - class ended 59 minutes ago', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 15, 59);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('recent');
});

test('inactive class - class starts in 16 minutes', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 12, 44);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('inactive');
});

test('inactive class - class ended an hour ago', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 16, 0);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('inactive');
});

test('inactive class - class is not running this week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 14, 0);
	expect(getClassState(classDetails, 6, minuteOfWeek)).toEqual('inactive');
});

test('current class - class started at the end of yesterday', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '23:00',
		labEndTime: '01:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(2, 0, 59);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('current');
});

test('upcoming class - class starts at the start of tomorrow', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 2,
		labStartTime: '00:00',
		labEndTime: '02:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 23, 45);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('upcoming');
});

test('recent class - class ended at the end of yesterday', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '21:30',
		labEndTime: '23:30',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(2, 0, 29);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('recent');
});

test('current class - class started at the end of last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '23:00',
		labEndTime: '01:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 30);
	expect(getClassState(classDetails, 2, minuteOfWeek)).toEqual('current');
});

test('current class - class is not running this week but started at the end of last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '23:00',
		labEndTime: '01:00',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 30);
	expect(getClassState(classDetails, 6, minuteOfWeek)).toEqual('current');
});

test('inactive class - class usually starts at the end of the week but was not running last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '23:00',
		labEndTime: '01:00',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 30);
	expect(getClassState(classDetails, 7, minuteOfWeek)).toEqual('inactive');
});

test('upcoming class - class starts start of next week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '00:00',
		labEndTime: '02:00',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(7, 23, 45);
	expect(getClassState(classDetails, 1, minuteOfWeek)).toEqual('upcoming');
});

test('upcoming class - class is not running this week but is running at the start of next week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '00:00',
		labEndTime: '02:00',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(7, 23, 45);
	expect(getClassState(classDetails, 6, minuteOfWeek)).toEqual('upcoming');
});

test('inactive class - class usually starts at the start of the week but is not running next week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '00:00',
		labEndTime: '02:00',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(7, 23, 45);
	expect(getClassState(classDetails, 5, minuteOfWeek)).toEqual('inactive');
});

test('recent class - class ended at the end of last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '21:30',
		labEndTime: '23:30',
		labLocation: '',
		weeks: '1-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 29);
	expect(getClassState(classDetails, 2, minuteOfWeek)).toEqual('recent');
});

test('recent class - class is not running this week but was running at the end of last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '21:30',
		labEndTime: '23:30',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 29);
	expect(getClassState(classDetails, 6, minuteOfWeek)).toEqual('recent');
});

test('inactive class - class usually ends at the end of the week but was not running last week', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 7,
		labStartTime: '21:30',
		labEndTime: '23:30',
		labLocation: '',
		weeks: '1-5,7-10',
	};
	const minuteOfWeek = toMinuteOfWeek(1, 0, 29);
	expect(getClassState(classDetails, 7, minuteOfWeek)).toEqual('inactive');
});
