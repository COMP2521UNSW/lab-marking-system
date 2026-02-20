import { expect, test } from '@jest/globals';

import { toLocalStartOfDay } from '@/lib/date';

test('given start of day in Los Angeles', () => {
	const date = new Date('2026-01-01T00:00:00-08:00');
	const expectedStartOfDay = new Date('2026-01-01T00:00:00-08:00');
	expect(toLocalStartOfDay(date, 'America/Los_Angeles')).toEqual(
		expectedStartOfDay,
	);
});

test('given end of day in Los Angeles', () => {
	const date = new Date('2026-01-01T23:59:59-08:00');
	const expectedStartOfDay = new Date('2026-01-01T00:00:00-08:00');
	expect(toLocalStartOfDay(date, 'America/Los_Angeles')).toEqual(
		expectedStartOfDay,
	);
});

test('given start of day in Auckland', () => {
	// Choose May to avoid daylight savings
	const date = new Date('2026-05-01T00:00:00+12:00');
	const expectedStartOfDay = new Date('2026-05-01T00:00:00+12:00');
	expect(toLocalStartOfDay(date, 'Pacific/Auckland')).toEqual(
		expectedStartOfDay,
	);
});

test('given end of day in Auckland', () => {
	// Choose May to avoid daylight savings
	const date = new Date('2026-05-01T23:59:59+12:00');
	const expectedStartOfDay = new Date('2026-05-01T00:00:00+12:00');
	expect(toLocalStartOfDay(date, 'Pacific/Auckland')).toEqual(
		expectedStartOfDay,
	);
});
