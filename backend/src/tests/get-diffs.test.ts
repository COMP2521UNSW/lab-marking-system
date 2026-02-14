import { expect, test } from '@jest/globals';

import { getDiffs } from '@/scripts/sync-marks';

test('new marks should be detected', () => {
	const syncedMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const dbMarks = [
		{ zid: '5000000', code: 'lab01', smsName: 'lab01_subj', mark: 3 },
		{ zid: '5000000', code: 'lab02', smsName: 'lab02_subj', mark: 2.5 },
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5111111', code: 'lab03', smsName: 'lab03_subj', mark: 4.5 },
		{ zid: '5222222', code: 'lab02', smsName: 'lab02_subj', mark: 1 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		{ zid: '5333333', code: 'lab03', smsName: 'lab03_subj', mark: 5 },
	];

	const diffs = getDiffs(syncedMarks, dbMarks);

	expect(diffs).toStrictEqual([
		{ zid: '5000000', code: 'lab01', smsName: 'lab01_subj', mark: 3 },
		{ zid: '5000000', code: 'lab02', smsName: 'lab02_subj', mark: 2.5 },
		{ zid: '5111111', code: 'lab03', smsName: 'lab03_subj', mark: 4.5 },
		{ zid: '5222222', code: 'lab02', smsName: 'lab02_subj', mark: 1 },
		{ zid: '5333333', code: 'lab03', smsName: 'lab03_subj', mark: 5 },
	]);
});

test('updated marks should be detected', () => {
	const syncedMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const dbMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const diffs = getDiffs(syncedMarks, dbMarks);

	expect(diffs).toStrictEqual([
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
	]);
});

test('new empty marks should be ignored', () => {
	const syncedMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const dbMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5111111', code: 'lab03', smsName: 'lab03_subj', mark: null },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		{ zid: '5333333', code: 'lab03', smsName: 'lab03_subj', mark: null },
	];

	const diffs = getDiffs(syncedMarks, dbMarks);

	expect(diffs).toStrictEqual([]);
});

test('deleted marks should be detected', () => {
	const syncedMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const dbMarks = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: null },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const diffs = getDiffs(syncedMarks, dbMarks);

	expect(diffs).toStrictEqual([
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: null },
	]);
});
