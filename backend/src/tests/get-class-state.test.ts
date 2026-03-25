import { expect, test } from '@jest/globals';

import type { ClassDetails } from '@workspace/types/classes';

import { getClassState } from '@/services/utils/classes';
import type { TermDate } from '@/services/utils/term';

test('current class - middle of class', () => {
	const classDetails: ClassDetails = {
		code: '',
		dayOfWeek: 1,
		labStartTime: '13:00',
		labEndTime: '15:00',
		labLocation: '',
		weeks: '1-10',
	};
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '14:00',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '13:00',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '14:59',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '12:45',
	};
	expect(getClassState(classDetails, termDate)).toEqual('upcoming');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '12:59',
	};
	expect(getClassState(classDetails, termDate)).toEqual('upcoming');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '15:00',
	};
	expect(getClassState(classDetails, termDate)).toEqual('recent');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '15:59',
	};
	expect(getClassState(classDetails, termDate)).toEqual('recent');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '12:44',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '16:00',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
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
	const termDate: TermDate = {
		week: 6,
		day: 1,
		time: '16:00',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
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
	const termDate: TermDate = {
		week: 1,
		day: 2,
		time: '00:59',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 1,
		day: 1,
		time: '23:45',
	};
	expect(getClassState(classDetails, termDate)).toEqual('upcoming');
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
	const termDate: TermDate = {
		week: 1,
		day: 2,
		time: '00:29',
	};
	expect(getClassState(classDetails, termDate)).toEqual('recent');
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
	const termDate: TermDate = {
		week: 2,
		day: 1,
		time: '00:30',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 6,
		day: 1,
		time: '00:30',
	};
	expect(getClassState(classDetails, termDate)).toEqual('current');
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
	const termDate: TermDate = {
		week: 7,
		day: 1,
		time: '00:30',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
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
	const termDate: TermDate = {
		week: 1,
		day: 7,
		time: '23:45',
	};
	expect(getClassState(classDetails, termDate)).toEqual('upcoming');
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
	const termDate: TermDate = {
		week: 6,
		day: 7,
		time: '23:45',
	};
	expect(getClassState(classDetails, termDate)).toEqual('upcoming');
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
	const termDate: TermDate = {
		week: 5,
		day: 7,
		time: '23:45',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
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
	const termDate: TermDate = {
		week: 2,
		day: 1,
		time: '00:29',
	};
	expect(getClassState(classDetails, termDate)).toEqual('recent');
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
	const termDate: TermDate = {
		week: 6,
		day: 1,
		time: '00:29',
	};
	expect(getClassState(classDetails, termDate)).toEqual('recent');
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
	const termDate: TermDate = {
		week: 7,
		day: 1,
		time: '00:29',
	};
	expect(getClassState(classDetails, termDate)).toEqual('inactive');
});
