import { expect, test } from '@jest/globals';

import { parseWeeksString } from '@/services/utils/classes';

test('empty string', () => {
	const weeks = '';
	const expectedOpenWeeks: number[][] = [];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});

test('exact weeks', () => {
	const weeks = '1,2,3,5,7,10';
	const expectedOpenWeeks = [[1], [2], [3], [5], [7], [10]];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});

test('week ranges', () => {
	const weeks = '1-2,3-5,7-10';
	const expectedOpenWeeks = [
		[1, 2],
		[3, 5],
		[7, 10],
	];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});

test('mix of exact weeks and week ranges', () => {
	const weeks = '1,3-5,7,9-10';
	const expectedOpenWeeks = [[1], [3, 5], [7], [9, 10]];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});

test('single exact week', () => {
	const weeks = '3';
	const expectedOpenWeeks = [[3]];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});

test('single week range', () => {
	const weeks = '3-5';
	const expectedOpenWeeks = [[3, 5]];
	expect(parseWeeksString(weeks)).toEqual(expectedOpenWeeks);
});
